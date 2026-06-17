/**
 * Planos do SaaS (níveis de assinatura).
 * Fonte única de verdade para preço, limites e recursos por plano.
 * A integração de pagamento (Stripe/Mercado Pago) é plugada depois;
 * por enquanto o plano é atribuído por clínica (campo Clinic.plan).
 */

export type PlanId = "basico" | "pro" | "premium";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // R$/mês
  tagline: string;
  /** Máximo de profissionais ativos; null = ilimitado */
  maxProfessionals: number | null;
  whatsapp: boolean;
  ai: boolean;
  highlights: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  basico: {
    id: "basico",
    name: "Básico",
    price: 99,
    tagline: "Para começar",
    maxProfessionals: 1,
    whatsapp: false,
    ai: false,
    highlights: [
      "Site público da clínica",
      "Agendamento online",
      "1 profissional",
      "Portfólio de casos",
      "Painel administrativo",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 199,
    tagline: "O mais escolhido",
    maxProfessionals: null,
    whatsapp: true,
    ai: false,
    highlights: [
      "Tudo do Básico",
      "Profissionais ilimitados",
      "WhatsApp integrado (confirmações e lembretes)",
      "Relatórios da agenda",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 349,
    tagline: "Experiência completa",
    maxProfessionals: null,
    whatsapp: true,
    ai: true,
    highlights: [
      "Tudo do Pro",
      "Assistente de IA no atendimento",
      "Suporte prioritário",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["basico", "pro", "premium"];

/** Retorna o plano pelo id, caindo no Básico se inválido/ausente. */
export function getPlan(id: string | null | undefined): Plan {
  return PLANS[(id as PlanId)] ?? PLANS.basico;
}

export function isPlanId(id: string | null | undefined): id is PlanId {
  return id === "basico" || id === "pro" || id === "premium";
}
