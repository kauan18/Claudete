/**
 * Camada de serviço Mercado Pago — Assinaturas (preapproval).
 * Cobrança recorrente mensal por plano. Sem MP_ACCESS_TOKEN o módulo
 * degrada (isConfigured() = false) e o checkout exibe aviso de configuração.
 *
 * Segurança do webhook: NUNCA confie no corpo da notificação para mudar plano.
 * Sempre reconsulte o preapproval autoritativo via getPreapproval() — uma
 * notificação forjada não consegue "authorizar" uma assinatura na nossa conta.
 */

import crypto from "crypto";
import { siteUrl, absoluteUrl } from "@/lib/site";
import { type Plan } from "@/lib/plans";

const MP_API = "https://api.mercadopago.com";

export function isMercadoPagoConfigured(): boolean {
  return !!process.env.MP_ACCESS_TOKEN;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export interface Preapproval {
  id: string;
  status: "pending" | "authorized" | "paused" | "cancelled" | string;
  external_reference?: string;
  payer_email?: string;
  reason?: string;
  auto_recurring?: { transaction_amount?: number; currency_id?: string; frequency?: number; frequency_type?: string };
  init_point?: string;
}

type CreateResult =
  | { ok: true; id: string; initPoint: string }
  | { ok: false; error: string };

/**
 * Cria uma assinatura (preapproval) recorrente mensal e retorna o init_point
 * (URL de checkout do Mercado Pago para onde o cliente é redirecionado).
 * external_reference = "<clinicId>:<planId>" para reconciliar no webhook.
 */
export async function createPreapproval(params: {
  clinicId: string;
  plan: Plan;
  payerEmail: string;
  backUrl: string;
}): Promise<CreateResult> {
  if (!isMercadoPagoConfigured()) {
    return { ok: false, error: "Mercado Pago não configurado (defina MP_ACCESS_TOKEN)." };
  }

  const body: Record<string, unknown> = {
    reason: `Assinatura ${params.plan.name} — OdontoApp`,
    external_reference: `${params.clinicId}:${params.plan.id}`,
    payer_email: params.payerEmail,
    back_url: params.backUrl,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: params.plan.price,
      currency_id: "BRL",
    },
    status: "pending",
  };

  // O Mercado Pago só aceita notification_url https (rejeita http/localhost).
  if (siteUrl.startsWith("https://")) {
    body.notification_url = absoluteUrl("/api/webhooks/mercadopago");
  }

  try {
    const res = await fetch(`${MP_API}/preapproval`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[mercadopago] erro ao criar preapproval:", data);
      return { ok: false, error: data?.message || "Falha ao criar assinatura no Mercado Pago." };
    }
    if (!data.init_point) {
      return { ok: false, error: "Mercado Pago não retornou o link de checkout." };
    }
    return { ok: true, id: String(data.id), initPoint: data.init_point as string };
  } catch (e) {
    console.error("[mercadopago] exceção ao criar preapproval:", e);
    return { ok: false, error: "Erro de comunicação com o Mercado Pago." };
  }
}

/** Cancela uma assinatura (preapproval) no Mercado Pago. */
export async function cancelPreapproval(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isMercadoPagoConfigured()) return { ok: false, error: "Mercado Pago não configurado." };
  try {
    const res = await fetch(`${MP_API}/preapproval/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      console.error("[mercadopago] erro ao cancelar preapproval:", data);
      return { ok: false, error: data?.message || "Falha ao cancelar a assinatura." };
    }
    return { ok: true };
  } catch (e) {
    console.error("[mercadopago] exceção ao cancelar preapproval:", e);
    return { ok: false, error: "Erro de comunicação com o Mercado Pago." };
  }
}

/** Lê o preapproval autoritativo (fonte da verdade do status). */
export async function getPreapproval(id: string): Promise<Preapproval | null> {
  if (!isMercadoPagoConfigured()) return null;
  try {
    const res = await fetch(`${MP_API}/preapproval/${encodeURIComponent(id)}`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Preapproval;
  } catch (e) {
    console.error("[mercadopago] exceção ao consultar preapproval:", e);
    return null;
  }
}

/**
 * Valida a assinatura HMAC do webhook (header x-signature).
 * Se MP_WEBHOOK_SECRET não estiver definido, não há como validar → retorna true
 * (a defesa real é a reconsulta autoritativa via getPreapproval).
 * manifest: `id:<dataId>;request-id:<xRequestId>;ts:<ts>;`
 */
export function verifyWebhookSignature(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sem segredo configurado, pula validação
  if (!params.xSignature || !params.dataId) return false;

  // x-signature: "ts=...,v1=..."
  const parts = Object.fromEntries(
    params.xSignature.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()];
    }),
  ) as { ts?: string; v1?: string };

  if (!parts.ts || !parts.v1) return false;

  // data.id alfanumérico deve ser minúsculo no manifest (numérico não muda)
  const id = /[a-zA-Z]/.test(params.dataId) ? params.dataId.toLowerCase() : params.dataId;
  const manifest = `id:${id};request-id:${params.xRequestId ?? ""};ts:${parts.ts};`;
  const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(parts.v1));
  } catch {
    return false;
  }
}

/** Mapeia o status do preapproval para o subscriptionStatus interno. */
export function mapPreapprovalStatus(status: string): "authorized" | "paused" | "cancelled" | "pending" {
  if (status === "authorized") return "authorized";
  if (status === "paused") return "paused";
  if (status === "cancelled") return "cancelled";
  return "pending";
}
