import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, type AppointmentStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/appointmentStatus";
import { CLINIC_TIMEZONE } from "@/lib/availability";

export const runtime = "nodejs";

const VALID_STATUS = ["solicitado", "confirmado", "cancelado", "concluido", "nao_compareceu"];

/** Escapa um valor para uma célula CSV (aspas duplas + escape de aspas). */
function csvCell(v: string): string {
  return `"${(v ?? "").replace(/"/g, '""')}"`;
}

/**
 * Exporta os agendamentos da clínica logada em CSV (para contabilidade/backup).
 * Escopado por clinicId; filtro opcional por status. Prefixo BOM (﻿) para
 * o Excel reconhecer UTF-8 e exibir acentos corretamente.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Não autorizado", { status: 401 });

  const clinicId = session.user.clinicId;
  if (!clinicId) return new Response("Usuário sem clínica.", { status: 403 });

  const status = new URL(req.url).searchParams.get("status");
  const where: Prisma.AppointmentWhereInput = { clinicId };
  if (status && VALID_STATUS.includes(status)) where.status = status as AppointmentStatus;

  const appts = await prisma.appointment.findMany({
    where,
    include: { service: true, professional: true },
    orderBy: { scheduledAt: "desc" },
  });

  const dateOpts: Intl.DateTimeFormatOptions = { timeZone: CLINIC_TIMEZONE };
  const timeOpts: Intl.DateTimeFormatOptions = { timeZone: CLINIC_TIMEZONE, hour: "2-digit", minute: "2-digit" };

  const header = ["Data", "Hora", "Paciente", "Telefone", "Email", "Servico", "Profissional", "Status", "Observacoes"];
  const rows = appts.map((a) => [
    a.scheduledAt.toLocaleDateString("pt-BR", dateOpts),
    a.scheduledAt.toLocaleTimeString("pt-BR", timeOpts),
    a.patientName,
    a.patientPhone,
    a.patientEmail ?? "",
    a.service.name,
    a.professional.name,
    STATUS_LABELS[a.status] ?? a.status,
    a.notes ?? "",
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: CLINIC_TIMEZONE });

  return new Response("﻿" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="agendamentos-${today}.csv"`,
    },
  });
}
