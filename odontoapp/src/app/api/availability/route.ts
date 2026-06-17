import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isWithinHours, zonedWallToUtc, dayKeyForDate, slotTimes, type WeeklyHours } from "@/lib/availability";
import { overlaps } from "@/lib/scheduling";
import { rateLimit, clientKey } from "@/lib/rate-limit";

// Granularidade dos horários oferecidos (minutos).
const SLOT_STEP_MIN = 30;

export async function GET(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "availability"), 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const sp = req.nextUrl.searchParams;
  const clinicId = sp.get("clinicId");
  const serviceId = sp.get("serviceId");
  const professionalId = sp.get("professionalId") || undefined;
  const date = sp.get("date");

  if (!clinicId || !serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const service = await prisma.service.findFirst({ where: { id: serviceId, clinicId, active: true } });
  if (!service) return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { businessHours: true, appointmentBuffer: true },
  });
  if (!clinic) return NextResponse.json({ error: "Clínica não encontrada." }, { status: 404 });

  // Horário de funcionamento no dia pedido.
  const dayKey = dayKeyForDate(date);
  const businessHours = clinic.businessHours as WeeklyHours | null;
  const window = businessHours?.[dayKey];
  if (!window || !Array.isArray(window)) return NextResponse.json({ slots: [] });

  // Profissionais elegíveis (escopados ao tenant).
  let pros;
  if (professionalId) {
    const pro = await prisma.professional.findFirst({ where: { id: professionalId, clinicId, active: true } });
    pros = pro ? [pro] : [];
  } else {
    pros = await prisma.professional.findMany({ where: { clinicId, active: true } });
  }
  if (pros.length === 0) return NextResponse.json({ slots: [] });

  const bufferMs = (clinic.appointmentBuffer ?? 0) * 60 * 1000;
  const durationMs = service.durationMin * 60 * 1000;
  const now = Date.now();

  // Agendamentos do dia para esses profissionais — uma única query.
  const dayStart = zonedWallToUtc(date, "00:00");
  const dayEnd = new Date(zonedWallToUtc(date, "23:59").getTime() + 60_000);
  const appts = await prisma.appointment.findMany({
    where: {
      clinicId,
      professionalId: { in: pros.map((p) => p.id) },
      status: { notIn: ["cancelado"] },
      scheduledAt: { lt: dayEnd },
      endsAt: { gt: dayStart },
    },
    select: { professionalId: true, scheduledAt: true, endsAt: true },
  });

  const candidates = slotTimes(window[0], window[1], service.durationMin, SLOT_STEP_MIN);
  const slots: { time: string; iso: string }[] = [];

  for (const hhmm of candidates) {
    const start = zonedWallToUtc(date, hhmm);
    const end = new Date(start.getTime() + durationMs);
    if (start.getTime() <= now) continue; // sem horários no passado

    // Slot disponível se ALGUM profissional elegível atende e está livre.
    const free = pros.some((p) => {
      if (!isWithinHours(p.workingHours, start, end)) return false;
      const busy = appts.some(
        (a) => a.professionalId === p.id && overlaps(start, end, a.scheduledAt, a.endsAt, bufferMs)
      );
      return !busy;
    });

    if (free) slots.push({ time: hhmm, iso: start.toISOString() });
  }

  return NextResponse.json({ slots });
}
