/**
 * Camada de IA isolada — fácil de trocar o provider ou evoluir para busca
 * semântica (embeddings) sem tocar nas rotas/UI.
 *
 * Provider atual: Claude (Anthropic SDK). Modelo via env `AI_MODEL`
 * (default claude-opus-4-8). Sem `ANTHROPIC_API_KEY`, degrada para um
 * fallback baseado na própria base de conhecimento.
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.AI_MODEL || "claude-opus-4-8";

export interface ClinicContext {
  clinicName: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  businessHours?: object | null;
  services: Array<{ name: string; description?: string | null; price?: string | null; durationMin: number }>;
  knowledgeBase: Array<{ question: string; answer: string }>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const DIAS: Record<string, string> = {
  mon: "Segunda", tue: "Terça", wed: "Quarta", thu: "Quinta",
  fri: "Sexta", sat: "Sábado", sun: "Domingo",
};

function formatHours(businessHours: object | null | undefined): string {
  if (!businessHours || typeof businessHours !== "object") return "não informado";
  const h = businessHours as Record<string, [string, string] | null>;
  return ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    .map((d) => `${DIAS[d]}: ${h[d] ? `${h[d]![0]}–${h[d]![1]}` : "Fechado"}`)
    .join(" | ");
}

/** Monta o system prompt injetando o contexto da clínica + regras de segurança. */
function buildSystemPrompt(ctx: ClinicContext): string {
  const services = ctx.services.length
    ? ctx.services
        .map((s) => `- ${s.name}${s.price ? ` (${s.price})` : ""} — ${s.durationMin}min${s.description ? `: ${s.description}` : ""}`)
        .join("\n")
    : "Nenhum serviço cadastrado.";
  const kb = ctx.knowledgeBase.length
    ? ctx.knowledgeBase.map((k) => `P: ${k.question}\nR: ${k.answer}`).join("\n\n")
    : "Vazia.";

  return `Você é a assistente virtual da clínica odontológica "${ctx.clinicName}". Responda dúvidas de pacientes de forma acolhedora, clara e em português do Brasil.

== INFORMAÇÕES DA CLÍNICA ==
${ctx.description ? `Sobre: ${ctx.description}\n` : ""}${ctx.address ? `Endereço: ${ctx.address}\n` : ""}${ctx.phone ? `Telefone: ${ctx.phone}\n` : ""}${ctx.whatsapp ? `WhatsApp: ${ctx.whatsapp}\n` : ""}Horário de funcionamento: ${formatHours(ctx.businessHours)}

== SERVIÇOS ==
${services}

== BASE DE CONHECIMENTO (perguntas frequentes) ==
${kb}

== REGRAS DE SEGURANÇA (OBRIGATÓRIAS) ==
1. Você NÃO é dentista. NUNCA dê diagnóstico, prescrição ou conselho clínico individual.
2. Diante de qualquer sintoma, dor ou dúvida de saúde, oriente gentilmente a agendar uma avaliação presencial.
3. NUNCA invente preços, horários ou informações que não estejam acima. Se não souber, admita e ofereça encaminhar para o WhatsApp ou para o agendamento online.
4. Sempre que fizer sentido, ofereça agendar uma consulta como próximo passo.
5. Seja concisa: 1 a 3 frases na maioria das respostas. Use um tom profissional e acolhedor.`;
}

/**
 * Gera a resposta do agente. Retorna null se a IA não estiver configurada
 * (o chamador então usa `fallbackResponse`).
 */
export async function generateAgentResponse(
  context: ClinicContext,
  messages: ChatMessage[]
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: buildSystemPrompt(context),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (!text) return null;

  // Pós-checagem de segurança: se a resposta parecer diagnóstico/prescrição, substitui.
  const check = validateAgentResponse(text);
  if (!check.safe) {
    return "Para a sua segurança, não consigo avaliar sintomas por aqui — isso precisa de uma avaliação presencial. Posso te ajudar a agendar uma consulta, ou você pode falar com a clínica pelo WhatsApp. 😊";
  }
  return text;
}

/**
 * Fallback sem IA: tenta casar a pergunta com a base de conhecimento;
 * senão, dá uma resposta segura apontando para agendamento/WhatsApp.
 */
export function fallbackResponse(context: ClinicContext, userMessage: string): string {
  const q = userMessage.toLowerCase();

  // 1) Match direto na base de conhecimento por palavras significativas.
  let best: { answer: string; score: number } | null = null;
  for (const item of context.knowledgeBase) {
    const words = item.question.toLowerCase().split(/[^a-zà-ú0-9]+/).filter((w) => w.length > 4);
    const score = words.filter((w) => q.includes(w)).length;
    if (score > 0 && (!best || score > best.score)) best = { answer: item.answer, score };
  }
  if (best) return best.answer;

  // 2) Intenções comuns.
  if (/(hor[áa]rio|aberto|funciona|atende)/.test(q)) {
    return `Nosso horário de funcionamento: ${formatHours(context.businessHours)}.`;
  }
  if (/(serviç|preç|valor|quanto custa|tratamento)/.test(q)) {
    const list = context.services.slice(0, 5).map((s) => `${s.name}${s.price ? ` (${s.price})` : ""}`).join(", ");
    return list
      ? `Oferecemos: ${list}. Quer agendar uma avaliação para conversar sobre o seu caso?`
      : "Posso te ajudar a agendar uma avaliação para conversarmos sobre o seu caso.";
  }
  if (/(endere|onde|local|fica)/.test(q) && context.address) {
    return `Estamos em ${context.address}.`;
  }

  // 3) Default seguro.
  return "Posso te ajudar com informações sobre serviços, horários e agendamento. Para dúvidas específicas ou qualquer sintoma, o ideal é agendar uma avaliação presencial — ou falar com a gente no WhatsApp. 😊";
}

/** Valida se a resposta viola as regras de segurança do agente. */
export function validateAgentResponse(response: string): { safe: boolean; reason?: string } {
  const lowerCase = response.toLowerCase();

  const forbiddenPatterns = [
    /tome\s+\d+\s*mg/i,
    /prescrevo/i,
    /receito/i,
    /diagn[óo]stico[:\s]/i,
    /voc[êe]\s+(tem|est[áa]\s+com)\s+(c[áa]rie|infec[çc][ãa]o|cisto|tumor|abscesso)/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(lowerCase)) {
      return { safe: false, reason: "Possível diagnóstico ou prescrição detectada" };
    }
  }

  return { safe: true };
}
