import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateAgentResponse, fallbackResponse, type ClinicContext } from "@/lib/ai";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getPlan } from "@/lib/plans";

const schema = z.object({
  clinicId: z.string(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
});

export async function POST(req: NextRequest) {
  // Rate limit do widget de chat público.
  const rl = rateLimit(clientKey(req, "chat"), 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas mensagens. Aguarde um instante." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { clinicId, messages } = parsed.data;
  if (messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "A última mensagem deve ser do paciente." }, { status: 400 });
  }

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return NextResponse.json({ error: "Clínica não encontrada." }, { status: 404 });

  const [services, kb] = await Promise.all([
    prisma.service.findMany({ where: { clinicId, active: true }, orderBy: { name: "asc" } }),
    prisma.knowledgeBase.findMany({ where: { clinicId, active: true } }),
  ]);

  const context: ClinicContext = {
    clinicName: clinic.name,
    description: clinic.description,
    address: clinic.address,
    phone: clinic.phone,
    whatsapp: clinic.whatsapp,
    businessHours: clinic.businessHours as object | null,
    services: services.map((s) => ({
      name: s.name,
      description: s.description,
      price: s.price ? `R$ ${Number(s.price).toFixed(2).replace(".", ",")}` : null,
      durationMin: s.durationMin,
    })),
    knowledgeBase: kb.map((k) => ({ question: k.question, answer: k.answer })),
  };

  const lastUser = messages[messages.length - 1].content;

  // Gate de plano: a IA real só roda em planos com IA (premium). Sem isso,
  // qualquer um poderia POSTar com um clinicId de plano básico e consumir IA.
  const aiEnabled = getPlan(clinic.plan).ai;

  let reply: string | null = null;
  let usedAI = false;
  if (aiEnabled) {
    try {
      reply = await generateAgentResponse(context, messages);
      usedAI = reply !== null;
    } catch (e) {
      console.error("[chat] erro ao gerar resposta da IA:", e);
      reply = null;
    }
  }

  if (!reply) reply = fallbackResponse(context, lastUser);

  return NextResponse.json({ reply, usedAI, whatsapp: clinic.whatsapp ?? null });
}
