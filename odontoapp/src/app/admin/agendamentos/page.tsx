import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { updateAppointmentStatus } from "./actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { STATUS_LABELS, statusBadge } from "@/lib/appointmentStatus";

export default async function AgendamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { clinicId } = await requireClinicSession();
  const { status, page } = await searchParams;

  const take = 20;
  const skip = ((parseInt(page ?? "1") || 1) - 1) * take;

  const validStatuses = ["solicitado", "confirmado", "cancelado", "concluido", "nao_compareceu"] as const;
  const statusFilter = validStatuses.find((s) => s === status);

  const where: Prisma.AppointmentWhereInput = {
    clinicId,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { service: true, professional: true },
      orderBy: { scheduledAt: "desc" },
      take,
      skip,
    }),
    prisma.appointment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);
  const currentPage = parseInt(page ?? "1") || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Agendamentos</h1>
          <p className="mt-1 text-ink-muted">{total} agendamento(s)</p>
        </div>
        <Button href="/admin/agendamentos/novo" size="sm">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {["", "solicitado", "confirmado", "cancelado", "concluido", "nao_compareceu"].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/agendamentos?status=${s}` : "/admin/agendamentos"}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              (status ?? "") === s ? "bg-primary text-white" : "bg-subtle text-ink-muted hover:bg-line hover:text-ink",
            )}
          >
            {s === "" ? "Todos" : STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
        {appointments.length === 0 ? (
          <div className="py-16 text-center text-ink-muted">
            <p>Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-subtle text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-6 py-3 text-left">Data / Hora</th>
                  <th className="px-6 py-3 text-left">Paciente</th>
                  <th className="px-6 py-3 text-left">Serviço</th>
                  <th className="px-6 py-3 text-left">Profissional</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="transition-colors hover:bg-subtle">
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-medium text-ink">{appt.scheduledAt.toLocaleDateString("pt-BR")}</p>
                      <p className="text-xs text-ink-muted">
                        {appt.scheduledAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink">{appt.patientName}</p>
                      <p className="text-xs text-ink-muted">{appt.patientPhone}</p>
                    </td>
                    <td className="px-6 py-4 text-ink-muted">{appt.service.name}</td>
                    <td className="px-6 py-4 text-ink-muted">{appt.professional.name}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(appt.status)}`}>
                        {STATUS_LABELS[appt.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {appt.status === "solicitado" && (
                          <form action={updateAppointmentStatus}>
                            <input type="hidden" name="id" value={appt.id} />
                            <input type="hidden" name="status" value="confirmado" />
                            <button type="submit" className="rounded-lg bg-success/15 px-2.5 py-1 text-xs font-medium text-success hover:bg-success/25">
                              Confirmar
                            </button>
                          </form>
                        )}
                        {(appt.status === "solicitado" || appt.status === "confirmado") && (
                          <form action={updateAppointmentStatus}>
                            <input type="hidden" name="id" value={appt.id} />
                            <input type="hidden" name="status" value="cancelado" />
                            <button type="submit" className="rounded-lg bg-danger/15 px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/25">
                              Cancelar
                            </button>
                          </form>
                        )}
                        <Link href={`/admin/agendamentos/${appt.id}`} className="text-xs font-medium text-primary hover:text-brand-ink">
                          Ver →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/agendamentos?${status ? `status=${status}&` : ""}page=${p}`}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                p === currentPage ? "bg-primary text-white" : "text-ink-muted hover:bg-subtle hover:text-ink",
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
