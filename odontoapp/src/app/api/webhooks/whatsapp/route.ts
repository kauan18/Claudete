import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimit, clientKey } from "@/lib/rate-limit";

/** Verificação do webhook (GET) — exigida pela Meta ao configurar o endpoint */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Valida a assinatura X-Hub-Signature-256 (HMAC-SHA256 do corpo cru com o App Secret).
 * Retorna true se válida. Se o App Secret não estiver configurado, retorna null
 * (degrada graciosamente em desenvolvimento, apenas registra um aviso).
 */
function verifySignature(rawBody: string, signatureHeader: string | null): boolean | null {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return null; // não configurado — não bloqueia em dev

  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const expected = crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const received = signatureHeader.slice("sha256=".length);

  // Comparação em tempo constante (evita timing attack); buffers de tamanhos
  // diferentes fariam timingSafeEqual lançar, então checamos o tamanho antes.
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(received, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Recebimento de mensagens (POST) — processamento básico, pronto para evoluir */
export async function POST(req: NextRequest) {
  // Rate limiting básico para a rota pública.
  const rl = rateLimit(clientKey(req, "wa-webhook"), 60, 60_000);
  if (!rl.allowed) {
    return new NextResponse("Too Many Requests", { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  }

  // Lê o corpo CRU (necessário para validar o HMAC byte a byte).
  const rawBody = await req.text();

  const valid = verifySignature(rawBody, req.headers.get("x-hub-signature-256"));
  if (valid === false) {
    return new NextResponse("Invalid signature", { status: 403 });
  }
  if (valid === null) {
    console.warn("[WhatsApp Webhook] WHATSAPP_APP_SECRET não configurado — assinatura não verificada (apenas dev).");
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // Processamento básico das mensagens recebidas.
  const entry = (body as { entry?: Array<{ changes?: Array<{ value?: { messages?: Array<{ from?: string; text?: { body?: string } }> } }> }> })
    ?.entry?.[0];
  const messages = entry?.changes?.[0]?.value?.messages;

  if (messages && messages.length > 0) {
    for (const msg of messages) {
      // TODO Fase 5: processar mensagens recebidas com o agente de IA
      console.log(`[WhatsApp] Mensagem de ${msg.from}: ${msg.text?.body ?? "(não-texto)"}`);
    }
  }

  // A Meta exige resposta 200 imediata.
  return NextResponse.json({ status: "ok" });
}
