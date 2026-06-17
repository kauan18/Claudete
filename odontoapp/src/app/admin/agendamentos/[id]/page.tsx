import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CheckCheck, UserX, XCircle } from "lucide-react";
import { updateAppointmentStatus } from "../actions";
import { STATUS_LABELS, statusBadge } from "@/lib/appointmentStatus";

type Props = { params: Promise<{ id: string }> };

export default async function AgendamentoDetail({ params }: Props) {
  const { id } = await params;
  const { clinicId } = await requireClinicSession();

  const appt = await prisma.appointment.findFirst({
    where: { id, clinicId },
    include: { service: true, professional: true },
  });

  if (!appt) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/agendamentos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink">Detalhes do Agendamento</h1>
      </div>

      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
        <Row label="Paciente" value={appt.patientName} />
        <Row label="Telefone" value={appt.patientPhone} />
        <Row label="E-mail" value={appt.patientEmail ?? "—"} />
        <Row label="Serviço" value={appt.service.name} />
        <Row label="Profissional" value={appt.professional.name} />
        <Row
          label="Data/Hora"
          value={`${appt.scheduledAt.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} às ${appt.scheduledAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
        />
        <div className="flex gap-4 px-6 py-4">
          <span className="w-32 shrink-0 text-sm text-ink-muted">Status</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(appt.status)}`}>
            {STATUS_LABELS[appt.status]}
          </span>
        </div>
        {appt.notes && <Row label="Observações" value={appt.notes} />}
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-3">
        {appt.status === "solicitado" && (
          <StatusButton id={appt.id} status="confirmado" className="bg-success text-white hover:opacity-90">
            <CheckCircle2 className="h-4 w-4" />
            Confirmar
          </StatusButton>
        )}
        {appt.status === "confirmado" && (
          <StatusButton id={appt.id} status="concluido" className="bg-ink text-page hover:opacity-90">
            <CheckCheck className="h-4 w-4" />
            Marcar como Concluído
          </StatusButton>
        )}
        {appt.status === "confirmado" && (
          <StatusButton id={appt.id} status="nao_compareceu" className="bg-warning text-white hover:opacity-90">
            <UserX className="h-4 w-4" />
            Não compareceu
          </StatusButton>
        )}
        {(appt.status === "solicitado" || appt.status === "confirmado") && (
          <StatusButton id={appt.id} status="cancelado" className="bg-danger/15 text-danger hover:bg-danger/25">
            <XCircle className="h-4 w-4" />
            Cancelar
          </StatusButton>
        )}
      </div>
    </div>
  );
}

function StatusButton({
  id,
  status,
  className,
  children,
}: {
  id: string;
  status: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <form action={updateAppointmentStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${className}`}
      >
        {children}
      </button>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 px-6 py-4">
      <span className="w-32 shrink-0 text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
