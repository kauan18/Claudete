import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAppointmentReminder } from "@/lib/whatsapp";
import { getPlan } from "@/lib/plans";

/**
 * Job de lembretes — chamado pelo cron (Vercel Cron ou similar).
 * Protegido por CRON_SECRET no header Authorization.
 *
 * - Lembrete 24h: agendamentos confirmados com início entre +1h e +24h (ainda não enviado).
 * - Lembrete 1h: agendamentos confirmados com início nas próximas 1h (ainda não enviado).
 *
 * As janelas não se sobrepõem, então um agendamento próximo recebe só o lembrete de 1h.
 * Idempotente: os flags reminderSent24h/1h evitam reenvio entre execuções.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const now = new Date();
  const in1h = new Date(now.getTime() + 60 * 60 * 1000);
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const credsOf = (clinic: { waToken: string | null; waPhoneNumberId: string | null }) =>
    clinic.waToken && clinic.waPhoneNumberId
      ? { token: clinic.waToken, phoneNumberId: clinic.waPhoneNumberId }
      : null;

  // ── Lembrete 24h ──────────────────────────────────────────────
  const due24h = await prisma.appointment.findMany({
    where: {
      status: "confirmado",
      reminderSent24h: false,
      scheduledAt: { gt: in1h, lte: in24h },
    },
    include: { clinic: true },
  });

  for (const appt of due24h) {
    if (getPlan(appt.clinic.plan).whatsapp) {
      await sendAppointmentReminder({
        patientPhone: appt.patientPhone,
        patientName: appt.patientName,
        clinicName: appt.clinic.name,
        scheduledAt: appt.scheduledAt,
        hoursAhead: 24,
        credentials: credsOf(appt.clinic),
      }).catch((e) => console.error("[cron/reminders] 24h:", e));
    }
    // Marca como enviado mesmo sem WhatsApp para não reprocessar a cada execução.
    await prisma.appointment.update({ where: { id: appt.id }, data: { reminderSent24h: true } });
  }

  // ── Lembrete 1h ───────────────────────────────────────────────
  const due1h = await prisma.appointment.findMany({
    where: {
      status: "confirmado",
      reminderSent1h: false,
      scheduledAt: { gt: now, lte: in1h },
    },
    include: { clinic: true },
  });

  for (const appt of due1h) {
    if (getPlan(appt.clinic.plan).whatsapp) {
      await sendAppointmentReminder({
        patientPhone: appt.patientPhone,
        patientName: appt.patientName,
        clinicName: appt.clinic.name,
        scheduledAt: appt.scheduledAt,
        hoursAhead: 1,
        credentials: credsOf(appt.clinic),
      }).catch((e) => console.error("[cron/reminders] 1h:", e));
    }
    await prisma.appointment.update({ where: { id: appt.id }, data: { reminderSent1h: true } });
  }

  return NextResponse.json({ ok: true, sent24h: due24h.length, sent1h: due1h.length });
}
