import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { Check, AlertCircle } from "lucide-react";
import { startSubscription, cancelSubscription } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { PLANS, PLAN_ORDER, getPlan } from "@/lib/plans";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";

const STATUS_LABEL: Record<string, string> = {
  none: "Sem assinatura",
  pending: "Pagamento pendente",
  authorized: "Ativa",
  paused: "Pausada",
  cancelled: "Cancelada",
};

const STATUS_BADGE: Record<string, string> = {
  authorized: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  paused: "bg-warning/15 text-warning",
  cancelled: "bg-danger/15 text-danger",
  none: "bg-subtle text-ink-muted",
};

export default async function AssinaturaPage({
  searchParams,
}: {
  searchParams: Promise<{ retorno?: string }>;
}) {
  const { clinicId } = await requireClinicSession();
  const { retorno } = await searchParams;
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return null;

  const current = getPlan(clinic.plan);
  const configured = isMercadoPagoConfigured();
  const status = clinic.subscriptionStatus ?? "none";

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Assinatura</h1>
        <p className="mt-1 text-ink-muted">Gerencie o plano da sua clínica</p>
      </div>

      {retorno && (
        <div className="rounded-2xl border border-info/30 bg-info/10 p-4 text-sm text-ink">
          Recebemos seu retorno do Mercado Pago. O status da assinatura é atualizado automaticamente assim que o
          pagamento é confirmado.
        </div>
      )}

      {/* Status atual */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <div>
          <p className="text-sm text-ink-muted">Plano atual</p>
          <p className="font-display text-lg font-bold text-ink">{current.name} — R$ {current.price}/mês</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[status] ?? STATUS_BADGE.none}`}>
            {STATUS_LABEL[status] ?? status}
          </span>
          {(status === "authorized" || status === "pending") && (
            <form action={cancelSubscription}>
              <ConfirmSubmitButton
                confirmMessage="Cancelar a assinatura? A clínica voltará ao plano Básico."
                className="text-xs font-medium text-danger hover:underline"
              >
                Cancelar assinatura
              </ConfirmSubmitButton>
            </form>
          )}
        </div>
      </div>

      {!configured && (
        <div className="flex items-start gap-2 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-ink">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span>
            Pagamentos ainda não estão ativos: falta configurar o Mercado Pago (variável <span className="font-mono">MP_ACCESS_TOKEN</span>).
            Você pode ver os planos abaixo; a assinatura ficará disponível assim que a integração for configurada.
          </span>
        </div>
      )}

      {/* Planos */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = id === clinic.plan && status === "authorized";
          const featured = id === "pro";
          return (
            <div
              key={id}
              className={`flex flex-col rounded-2xl border bg-surface p-6 shadow-soft ${
                isCurrent ? "border-success ring-2 ring-success/30" : featured ? "border-primary" : "border-line"
              }`}
            >
              <h2 className="font-display text-lg font-bold text-ink">{plan.name}</h2>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-sm text-ink-muted">R$</span>
                <span className="font-display text-3xl font-bold text-ink">{plan.price}</span>
                <span className="mb-1 text-sm text-ink-muted">/mês</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {h}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <span className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-success/15 px-4 text-sm font-semibold text-success">
                  Plano atual
                </span>
              ) : (
                <form action={startSubscription} className="mt-5">
                  <input type="hidden" name="planId" value={id} />
                  <button
                    type="submit"
                    disabled={!configured}
                    className={`inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors ${
                      featured
                        ? "bg-primary text-white hover:bg-brand-ink"
                        : "border border-line bg-surface text-ink hover:bg-subtle"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    Assinar {plan.name}
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink-muted">
        A cobrança é mensal e recorrente via Mercado Pago. Você pode cancelar quando quiser pelo painel do Mercado Pago.
      </p>
    </div>
  );
}
