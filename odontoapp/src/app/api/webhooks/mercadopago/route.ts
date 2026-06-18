import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getPreapproval,
  verifyWebhookSignature,
  mapPreapprovalStatus,
  isMercadoPagoConfigured,
} from "@/lib/mercadopago";
import { isPlanId } from "@/lib/plans";

export const runtime = "nodejs";

/**
 * Webhook de assinaturas do Mercado Pago.
 * Princípio de segurança: NÃO confiamos no corpo da notificação para mudar
 * plano. Extraímos o id, RECONSULTAMOS o preapproval autoritativo via API
 * (com nosso access token) e só então atualizamos. Uma notificação forjada
 * não consegue "authorizar" uma assinatura na nossa conta.
 */
export async function POST(req: NextRequest) {
  // Sempre responder 200 rápido em casos sem ação evita reentregas infinitas.
  if (!isMercadoPagoConfigured()) return NextResponse.json({ ok: true, skipped: "not-configured" });

  const url = new URL(req.url);
  let body: { type?: string; topic?: string; action?: string; data?: { id?: string } } = {};
  try {
    body = await req.json();
  } catch {
    /* corpo pode vir vazio com query params */
  }

  const type = body.type || body.topic || url.searchParams.get("type") || url.searchParams.get("topic") || "";
  const dataId =
    body.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id") || null;

  // Validação de assinatura (se MP_WEBHOOK_SECRET estiver definido).
  const ok = verifyWebhookSignature({
    xSignature: req.headers.get("x-signature"),
    xRequestId: req.headers.get("x-request-id"),
    dataId,
  });
  if (!ok) return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });

  // Só tratamos eventos de assinatura (preapproval). Demais: apenas ack.
  if (!/preapproval/i.test(type) || !dataId) {
    return NextResponse.json({ ok: true, ignored: type || "no-id" });
  }

  // Fonte da verdade: reconsulta o preapproval no Mercado Pago.
  const pre = await getPreapproval(dataId);
  if (!pre) return NextResponse.json({ ok: true, note: "preapproval não encontrado" });

  // external_reference = "<clinicId>:<planId>" (definido na criação por nós).
  const [clinicId, planId] = (pre.external_reference || "").split(":");
  if (!clinicId) return NextResponse.json({ ok: true, note: "sem external_reference" });

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return NextResponse.json({ ok: true, note: "clínica não encontrada" });

  const status = mapPreapprovalStatus(pre.status);

  const data: {
    subscriptionStatus: string;
    mpPreapprovalId: string;
    subscriptionUpdatedAt: Date;
    plan?: string;
  } = {
    subscriptionStatus: status,
    mpPreapprovalId: pre.id,
    subscriptionUpdatedAt: new Date(),
  };

  if (status === "authorized" && isPlanId(planId)) {
    // Assinatura ativa → aplica o plano contratado.
    data.plan = planId;
  } else if (status === "cancelled") {
    // Cancelada → rebaixa para o plano básico.
    data.plan = "basico";
  }
  // paused/pending: mantém o plano atual (período de carência).

  await prisma.clinic.update({ where: { id: clinicId }, data });

  return NextResponse.json({ ok: true, status });
}
