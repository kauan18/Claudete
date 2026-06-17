import Link from "next/link";
import { Check, X, ArrowLeft } from "lucide-react";
import { PLANS, PLAN_ORDER } from "@/lib/plans";

export const metadata = {
  title: "Planos e Preços — OdontoApp",
  description: "Escolha o plano ideal para a sua clínica odontológica.",
};

function formatPrice(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="mt-8 text-center">
          <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-ink">
            Planos
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold text-ink">Escolha o plano da sua clínica</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-muted">
            Comece simples e evolua conforme sua clínica cresce. Sem fidelidade — cancele quando quiser.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const featured = id === "pro";
            return (
              <div
                key={id}
                className={`relative flex flex-col rounded-3xl border bg-surface p-7 shadow-soft ${
                  featured ? "border-primary ring-2 ring-primary/30" : "border-line"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-soft">
                    {plan.tagline}
                  </span>
                )}

                <h2 className="font-display text-xl font-bold text-ink">{plan.name}</h2>
                {!featured && <p className="mt-0.5 text-sm text-ink-muted">{plan.tagline}</p>}

                <div className="mt-4 flex items-end gap-1">
                  <span className="text-sm font-medium text-ink-muted">R$</span>
                  <span className="font-display text-4xl font-bold text-ink">{formatPrice(plan.price)}</span>
                  <span className="mb-1 text-sm text-ink-muted">/mês</span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-sm text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {h}
                    </li>
                  ))}
                  {!plan.whatsapp && (
                    <li className="flex items-start gap-2.5 text-sm text-ink-muted">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                      WhatsApp integrado
                    </li>
                  )}
                  {!plan.ai && (
                    <li className="flex items-start gap-2.5 text-sm text-ink-muted">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                      Assistente de IA
                    </li>
                  )}
                </ul>

                <Link
                  href="/login"
                  className={`mt-7 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors ${
                    featured
                      ? "bg-primary text-white hover:bg-brand-ink"
                      : "border border-line bg-surface text-ink hover:bg-subtle"
                  }`}
                >
                  Assinar {plan.name}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-ink-muted">
          Precisa de algo sob medida? <Link href="/login" className="font-medium text-primary hover:underline">Fale com a gente</Link>.
        </p>
      </div>
    </div>
  );
}
