import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { notifyClinicNewAppointment } from "@/lib/whatsapp";
import { getPlan } from "@/lib/plans";
import { isWithinHours } from "@/lib/availability";
import { cancelPath } from "@/lib/appointmentToken";
import { absoluteUrl } from "@/lib/site";
import { conflictWhere } from "@/lib/scheduling";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const schema = z.object({
  clinicId: z.string(),
  serviceId: z.string(),
  professionalId: z.string().optional(),
  scheduledAt: z.string().datetime(),
  patientName: z.string().min(2).max(120),
  patientPhone: z.string().min(8).max(20),
  patientEmail: z.string().email().max(160).optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
  lgpdConsent: z.boolean().refine((v) => v === true, "Consentimento é obrigatório"),
});

export async function POST(req: NextRequest) {
  // Rate limiting básico: protege a rota pública contra abuso (por IP).
  const rl = rateLimit(clientKey(req, "appointments"), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { clinicId, serviceId, professionalId, scheduledAt, patientName, patientPhone, patientEmail, notes, lgpdConsent } =
    parsed.data;

  // Serviço precisa existir, estar ativo e pertencer ao tenant.
  const service = await prisma.service.findFirst({ where: { id: serviceId, clinicId, active: true } });
  if (!service) {
    return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
  }

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return NextResponse.json({ error: "Clínica não encontrada." }, { status: 404 });

  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + service.durationMin * 60 * 1000);

  // Não permite agendamento no passado (validação server-side).
  if (start.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Não é possível agendar em um horário no passado." }, { status: 400 });
  }

  // Precisa estar dentro do horário de funcionamento da clínica.
  if (!isWithinHours(clinic.businessHours, start, end)) {
    return NextResponse.json({ error: "Horário fora do funcionamento da clínica." }, { status: 409 });
  }

  // Buffer configurável entre consultas (em ms).
  const bufferMs = (clinic.appointmentBuffer ?? 0) * 60 * 1000;

  // Candidatos elegíveis pela AGENDA do profissional (workingHours), já escopados ao tenant.
  let candidates: string[];
  if (professionalId) {
    const pro = await prisma.professional.findFirst({ where: { id: professionalId, clinicId, active: true } });
    if (!pro) return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
    if (!isWithinHours(pro.workingHours, start, end)) {
      return NextResponse.json({ error: "O profissional não atende neste horário." }, { status: 409 });
    }
    candidates = [pro.id];
  } else {
    const pros = await prisma.professional.findMany({ where: { clinicId, active: true } });
    candidates = pros.filter((p) => isWithinHours(p.workingHours, start, end)).map((p) => p.id);
    if (candidates.length === 0) {
      return NextResponse.json({ error: "Nenhum profissional atende neste horário." }, { status: 409 });
    }
  }

  // Seleção do profissional + checagem de conflito + criação em transação SERIALIZABLE.
  // Evita overbooking quando duas solicitações concorrem pelo mesmo horário:
  // o Postgres (SSI) aborta uma com falha de serialização (P2034) e nós refazemos.
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          let chosen: string | null = null;
          for (const id of candidates) {
            const conflict = await tx.appointment.findFirst({
              where: conflictWhere({ clinicId, professionalId: id, start, end, bufferMs }),
            });
            if (!conflict) {
              chosen = id;
              break;
            }
          }
          if (!chosen) return { conflict: true as const };

          const appt = await tx.appointment.create({
            data: {
              clinicId,
              serviceId,
              professionalId: chosen,
              scheduledAt: start,
              endsAt: end,
              patientName,
              patientPhone,
              patientEmail: patientEmail || null,
              notes: notes || null,
              lgpdConsent,
              status: "solicitado",
            },
          });
          return { conflict: false as const, id: appt.id };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );

      if (result.conflict) {
        const msg = professionalId
          ? "Horário indisponível para este profissional."
          : "Nenhum profissional disponível neste horário.";
        return NextResponse.json({ error: msg }, { status: 409 });
      }

      // Notificar a clínica via WhatsApp (best-effort, não bloqueia a resposta).
      // Apenas planos que incluem WhatsApp.
      if (clinic.whatsapp && getPlan(clinic.plan).whatsapp) {
        notifyClinicNewAppointment({
          clinicWhatsapp: clinic.whatsapp,
          patientName,
          serviceName: service.name,
          scheduledAt: start,
          credentials:
            clinic.waToken && clinic.waPhoneNumberId
              ? { token: clinic.waToken, phoneNumberId: clinic.waPhoneNumberId }
              : null,
        }).catch(console.error);
      }

      const cancelUrl = absoluteUrl(cancelPath(clinic.slug, result.id));
      return NextResponse.json({ id: result.id, cancelUrl }, { status: 201 });
    } catch (e) {
      // P2034 = conflito de escrita / falha de serialização → vale retry.
      const isSerializationFailure = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034";
      if (isSerializationFailure && attempt < MAX_ATTEMPTS) continue;
      console.error("[appointments] erro ao criar agendamento:", e);
      return NextResponse.json({ error: "Não foi possível concluir o agendamento. Tente novamente." }, { status: 500 });
    }
  }

  // Esgotou as tentativas por concorrência.
  return NextResponse.json({ error: "Conflito de concorrência. Tente novamente." }, { status: 409 });
}
