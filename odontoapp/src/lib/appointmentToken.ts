import crypto from "crypto";

/**
 * Token stateless para o paciente acessar/cancelar o próprio agendamento por
 * link, sem login. HMAC-SHA256 do id com o AUTH_SECRET — não precisa de coluna
 * no banco e vale para agendamentos já existentes. Só quem tem o link (enviado
 * ao paciente) consegue um token válido; não dá para adivinhar/enumerar.
 */
function secret(): string {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

export function makeCancelToken(appointmentId: string): string {
  return crypto.createHmac("sha256", secret()).update(`cancel:${appointmentId}`).digest("base64url");
}

export function verifyCancelToken(appointmentId: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = makeCancelToken(appointmentId);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

/** Caminho relativo da página de acompanhamento/cancelamento do paciente. */
export function cancelPath(slug: string, appointmentId: string): string {
  return `/c/${slug}/agendamento/${appointmentId}?t=${makeCancelToken(appointmentId)}`;
}
