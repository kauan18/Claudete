import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { STATUS_LABELS, statusBadge } from "@/lib/appointmentStatus";

export default async function AgendaPage() {
  const { clinicId } = await requireClinicSession();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      scheduledAt: { gte: startOfToday },
      status: { notIn: ["cancelado"] },
    },
    include: { service: true, professional: true },
    orderBy: { scheduledAt: "asc" },
  });

  // Agrupa por dia (chave = data ISO yyyy-mm-dd no horário local)
  const groups = new Map<string, typeof appointments>();
  for (const appt of appointments) {
    const d = appt.scheduledAt;
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(appt);
  }

  const todayKey = `${startOfToday.getFullYear()}-${startOfToday.getMonth()}-${startOfToday.getDate()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Agenda</h1>
          <p className="mt-1 text-ink-muted">Próximas consultas, agrupadas por dia</p>
        </div>
        <Button href="/admin/agendamentos/novo" size="sm">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface py-16 text-center text-ink-muted shadow-soft">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-ink-muted" />
          <p>Nenhuma consulta futura agendada.</p>
          <Link href="/admin/agendamentos/novo" className="mt-3 inline-block text-sm font-medium text-primary hover:text-brand-ink">
            Criar agendamento →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([key, dayAppts]) => {
            const first = dayAppts[0].scheduledAt;
            const label = first.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });
            return (
              <section key={key} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
                <div className="flex items-center justify-between border-b border-line bg-subtle px-6 py-3">
                  <h2 className="font-display text-sm font-semibold capitalize text-ink">{label}</h2>
                  <span className="flex items-center gap-2 text-xs text-ink-muted">
                    {key === todayKey && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">Hoje</span>
                    )}
                    {dayAppts.length} consulta(s)
                  </span>
                </div>

                <div className="divide-y divide-line">
                  {dayAppts.map((appt) => (
                    <Link
                      key={appt.id}
                      href={`/admin/agendamentos/${appt.id}`}
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-subtle"
                    >
                      <div className="min-w-[56px] text-center">
                        <p className="text-sm font-bold text-ink">
                          {appt.scheduledAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs text-ink-muted">{appt.service.durationMin}min</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{appt.patientName}</p>
                        <p className="truncate text-sm text-ink-muted">
                          {appt.service.name} · {appt.professional.name}
                        </p>
                      </div>
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(appt.status)}`}>
                        {STATUS_LABELS[appt.status]}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
