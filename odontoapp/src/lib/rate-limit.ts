/**
 * Rate limiting básico em memória (janela fixa).
 *
 * Suficiente para proteger rotas públicas contra abuso simples em uma única
 * instância. ATENÇÃO: o estado é por processo — em ambiente serverless
 * (Vercel) cada instância tem seu próprio contador. Para produção com
 * múltiplas instâncias, trocar por um store compartilhado (ex: Upstash Redis).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Limpeza periódica para não vazar memória com chaves expiradas.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Consome 1 do limite para `key`. Permite até `limit` requisições por janela
 * de `windowMs`. Retorna se foi permitido e quanto falta para resetar.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
}

/** Extrai um identificador de cliente (IP) dos headers da requisição. */
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0] : null)?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
