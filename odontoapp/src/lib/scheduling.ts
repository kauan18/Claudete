import { Prisma } from "@prisma/client";

/**
 * Cláusula Prisma para detectar conflito de horário de um profissional,
 * respeitando o buffer (em ms) entre consultas. Compartilhada entre a criação
 * de agendamento e o cálculo de disponibilidade para evitar divergência.
 */
export function conflictWhere(args: {
  clinicId: string;
  professionalId: string;
  start: Date;
  end: Date;
  bufferMs: number;
}): Prisma.AppointmentWhereInput {
  const { clinicId, professionalId, start, end, bufferMs } = args;
  return {
    clinicId,
    professionalId,
    status: { notIn: ["cancelado"] },
    AND: [
      { scheduledAt: { lt: new Date(end.getTime() + bufferMs) } },
      { endsAt: { gt: new Date(start.getTime() - bufferMs) } },
    ],
  };
}

/** Verifica sobreposição entre [aStart,aEnd] e [bStart,bEnd] com buffer (ms). */
export function overlaps(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
  bufferMs: number
): boolean {
  return bStart.getTime() < aEnd.getTime() + bufferMs && bEnd.getTime() > aStart.getTime() - bufferMs;
}
