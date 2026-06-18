import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifyCancelToken } from "@/lib/appointmentToken";
import { cancelByToken } from "./actions";
import { STATUS_LABELS, statusBadge } from "@/lib/appointmentStatus";

type Props = {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ t?: string; cancelado?: string }>;
};

export default async function AgendamentoPaciente({ params, searchParams }: Props) {
  const { slug, id } = await params;
  const { t, cancelado } = await searchParams;

  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: {
      service: true,
      professional: true,
      clinic: { select: { slug: true, name: true, cancelMinHours: true, phone: true, whatsapp: true } },
    },
  });
  if (!appt || appt.clinic.slug !== slug) notFound();

  const valid = verifyCancelToken(id, t);

  const dateStr =
    appt.scheduledAt.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) +
    " às " +
    appt.scheduledAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const cutoff = appt.scheduledAt.getTime() - appt.clinic.cancelMinHours * 3600 * 1000;
  const withinWindow = Date.now() <= cutoff;
  const isActive = appt.status === "solicitado" || appt.status === "confirmado";
  const justCancelled = cancelado === "1" || appt.status === "cancelado";

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-3xl border border-line bg-surface p-8 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint text-brand-ink">
            <CalendarCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-ink">Seu agendamento</h1>
            <p className="text-sm text-ink-muted">{appt.clinic.name}</p>
          </div>
        </div>

        {!valid ? (
          <div className="mt-8 flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-ink">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            Link inválido ou expirado. Confira o endereço recebido ou entre em contato com a clínica.
          </div>
        ) : (
          <>
            <dl className="mt-8 space-y-3 text-sm">
              <Row label="Serviço" value={appt.service.name} />
              <Row label="Profissional" value={appt.professional.name} />
              <Row label="Data e hora" value={dateStr} />
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Status</dt>
                <dd>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(appt.status)}`}>
                    {STATUS_LABELS[appt.status]}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-line pt-6">
              {justCancelled ? (
                <p className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-ink">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  Consulta cancelada. Se precisar, é só agendar novamente.
                </p>
              ) : !isActive ? (
                <p className="text-sm text-ink-muted">Este agendamento não pode mais ser cancelado online.</p>
              ) : !withinWindow ? (
                <p className="flex items-start gap-2 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-ink">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  O prazo para cancelamento online ({appt.clinic.cancelMinHours}h de antecedência) já passou.
                  {appt.clinic.whatsapp || appt.clinic.phone
                    ? " Entre em contato com a clínica para remarcar ou cancelar."
                    : ""}
                </p>
              ) : (
                <form action={cancelByToken} className="space-y-4">
                  <input type="hidden" name="id" value={appt.id} />
                  <input type="hidden" name="t" value={t} />
                  <input type="hidden" name="slug" value={slug} />
                  <p className="text-sm text-ink-muted">
                    Precisa cancelar? Você pode fazer isso até {appt.clinic.cancelMinHours}h antes da consulta.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-5 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/20"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancelar consulta
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <Link href={`/c/${slug}`} className="text-sm font-medium text-primary hover:underline">
            Voltar ao site da clínica
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
