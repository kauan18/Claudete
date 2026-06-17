import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  BarChart3,
  UserX,
  Hourglass,
  Plus,
  Stethoscope,
  Settings,
  ArrowRight,
} from "lucide-react";
import { ToothMark } from "@/components/ui/ToothMark";
import { STATUS_LABELS, statusBadge } from "@/lib/appointmentStatus";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // super_admin sem clínica vai para /super-admin
  if (session.user.role === "super_admin" && !session.user.clinicId) {
    redirect("/super-admin");
  }

  const clinicId = session.user.clinicId!;
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayAppointments, monthTotal, noShowCount, pendingCount] = await Promise.all([
    prisma.appointment.findMany({
      where: { clinicId, scheduledAt: { gte: startOfDay, lte: endOfDay } },
      include: { professional: true, service: true },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.appointment.count({
      where: { clinicId, scheduledAt: { gte: startOfMonth }, status: { notIn: ["cancelado"] } },
    }),
    prisma.appointment.count({
      where: { clinicId, status: "nao_compareceu", scheduledAt: { gte: startOfMonth } },
    }),
    prisma.appointment.count({ where: { clinicId, status: "solicitado" } }),
  ]);

  const noShowRate = monthTotal > 0 ? ((noShowCount / monthTotal) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 capitalize text-ink-muted">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Hoje" value={todayAppointments.length} Icon={CalendarDays} tone="info" />
        <MetricCard label="Mês (total)" value={monthTotal} Icon={BarChart3} tone="success" />
        <MetricCard label="Taxa de no-show" value={`${noShowRate}%`} Icon={UserX} tone="danger" />
        <MetricCard label="Aguardando confirmação" value={pendingCount} Icon={Hourglass} tone="warning" />
      </div>

      {/* Agenda de hoje */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">Agenda de hoje</h2>
          <Link href="/admin/agenda" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-brand-ink">
            Ver agenda completa
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-ink-muted">Nenhum agendamento para hoje.</p>
            <Link
              href="/admin/agendamentos/novo"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-brand-ink"
            >
              <Plus className="h-4 w-4" />
              Criar agendamento manual
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {todayAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-subtle">
                <div className="min-w-[56px] text-center">
                  <p className="text-sm font-bold text-ink">
                    {appt.scheduledAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-ink-muted">{appt.service.durationMin}min</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{appt.patientName}</p>
                  <p className="truncate text-sm text-ink-muted">
                    {appt.service.name} · Dr(a). {appt.professional.name}
                  </p>
                </div>
                <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(appt.status)}`}>
                  {STATUS_LABELS[appt.status]}
                </span>
                <Link
                  href={`/admin/agendamentos/${appt.id}`}
                  className="whitespace-nowrap text-sm font-medium text-primary hover:text-brand-ink"
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { href: "/admin/agendamentos/novo", label: "Novo agendamento", Icon: Plus },
          { href: "/admin/servicos", label: "Gerenciar serviços", Icon: ToothMark },
          { href: "/admin/profissionais", label: "Profissionais", Icon: Stethoscope },
          { href: "/admin/configuracoes", label: "Configurações", Icon: Settings },
        ].map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: string | number;
  Icon: React.ComponentType<{ className?: string }>;
  tone: "info" | "success" | "danger" | "warning";
}) {
  const tones: Record<string, string> = {
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="font-display text-2xl font-bold text-ink">{value}</p>
          <p className="text-sm text-ink-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
