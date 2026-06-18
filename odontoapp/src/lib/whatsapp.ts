/**
 * Camada de serviço WhatsApp Cloud API.
 * Cada clínica pode ter suas próprias credenciais (por tenant).
 * Fallback para link wa.me se a API não estiver configurada.
 */

interface WhatsAppCredentials {
  token: string;
  phoneNumberId: string;
}

interface SendTextParams {
  to: string; // número no formato 5511999999999
  message: string;
  credentials: WhatsAppCredentials | null;
}

interface SendTemplateParams {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: object[];
  credentials: WhatsAppCredentials | null;
}

function resolveCredentials(tenantCreds: WhatsAppCredentials | null): WhatsAppCredentials | null {
  if (tenantCreds?.token && tenantCreds?.phoneNumberId) return tenantCreds;

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneNumberId) return { token, phoneNumberId };
  return null;
}

/**
 * Normaliza telefone para o formato internacional exigido pela Graph API
 * (ex: "11 99999-8888" → "5511999998888"). Assume Brasil (55) se sem DDI.
 */
export function normalizePhone(raw: string): string {
  let digits = (raw || "").replace(/\D/g, "");
  digits = digits.replace(/^0+/, ""); // remove zeros à esquerda (ex: 0 operadora)
  if (!digits.startsWith("55")) digits = `55${digits}`;
  return digits;
}

export async function sendWhatsAppText({ to, message, credentials }: SendTextParams) {
  const creds = resolveCredentials(credentials);
  const phone = normalizePhone(to);

  if (!creds) {
    // Fallback: retorna link wa.me para abrir conversa manualmente
    const encoded = encodeURIComponent(message);
    return { ok: false, fallbackUrl: `https://wa.me/${phone}?text=${encoded}` };
  }

  const url = `https://graph.facebook.com/v20.0/${creds.phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: message },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("[WhatsApp] Erro ao enviar mensagem:", err);
    return { ok: false, error: err };
  }

  return { ok: true };
}

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = "pt_BR",
  components = [],
  credentials,
}: SendTemplateParams) {
  const creds = resolveCredentials(credentials);
  const phone = normalizePhone(to);

  if (!creds) {
    return { ok: false, fallbackUrl: `https://wa.me/${phone}` };
  }

  const url = `https://graph.facebook.com/v20.0/${creds.phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("[WhatsApp] Erro ao enviar template:", err);
    return { ok: false, error: err };
  }

  return { ok: true };
}

/** Notifica a clínica de nova solicitação de agendamento */
export async function notifyClinicNewAppointment(params: {
  clinicWhatsapp: string;
  patientName: string;
  serviceName: string;
  scheduledAt: Date;
  credentials: WhatsAppCredentials | null;
}) {
  const dateStr = params.scheduledAt.toLocaleString("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });

  return sendWhatsAppText({
    to: params.clinicWhatsapp,
    message: `📅 *Nova solicitação de agendamento!*\n\nPaciente: ${params.patientName}\nServiço: ${params.serviceName}\nData/hora: ${dateStr}\n\nAcesse o painel para confirmar.`,
    credentials: params.credentials,
  });
}

/** Envia confirmação ao paciente */
export async function sendAppointmentConfirmation(params: {
  patientPhone: string;
  patientName: string;
  clinicName: string;
  serviceName: string;
  professionalName: string;
  scheduledAt: Date;
  credentials: WhatsAppCredentials | null;
  cancelUrl?: string;
}) {
  const dateStr = params.scheduledAt.toLocaleString("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });

  const cancelLine = params.cancelUrl ? `\n\nPrecisa cancelar? ${params.cancelUrl}` : "";

  return sendWhatsAppText({
    to: params.patientPhone,
    message: `✅ *Consulta confirmada!*\n\nOlá, ${params.patientName}! Sua consulta foi confirmada.\n\n🏥 ${params.clinicName}\n🦷 Serviço: ${params.serviceName}\n👨‍⚕️ Profissional: ${params.professionalName}\n📅 ${dateStr}${cancelLine}\n\nAté logo!`,
    credentials: params.credentials,
  });
}

/** Envia lembrete ao paciente (24h ou 1h antes) */
export async function sendAppointmentReminder(params: {
  patientPhone: string;
  patientName: string;
  clinicName: string;
  scheduledAt: Date;
  hoursAhead: 24 | 1;
  credentials: WhatsAppCredentials | null;
}) {
  const timeStr = params.scheduledAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const msg =
    params.hoursAhead === 24
      ? `⏰ *Lembrete de consulta — amanhã!*\n\nOlá, ${params.patientName}! Sua consulta na ${params.clinicName} é *amanhã às ${timeStr}*.\n\nNos vemos em breve! 😊`
      : `⏰ *Sua consulta é em 1 hora!*\n\nOlá, ${params.patientName}! Sua consulta na ${params.clinicName} começa às *${timeStr}*.\n\nEstamos te esperando! 🦷`;

  return sendWhatsAppText({
    to: params.patientPhone,
    message: msg,
    credentials: params.credentials,
  });
}
