/**
 * Cálculo de disponibilidade ciente de fuso horário.
 *
 * `scheduledAt`/`endsAt` são armazenados em UTC, mas os horários de funcionamento
 * da clínica e a agenda do profissional são wall-clock LOCAL. Convertemos o
 * instante UTC para o fuso da clínica antes de comparar.
 *
 * Estrutura esperada (Json no banco):
 *   { mon: ["08:00","18:00"], tue: [...], ..., sun: null }
 * Dia ausente ou null = fechado/não atende.
 */

// Brasil não usa horário de verão desde 2019; America/Sao_Paulo cobre o caso comum.
// Sobrescrevível por env caso a clínica opere em outro fuso.
export const CLINIC_TIMEZONE = process.env.CLINIC_TIMEZONE || "America/Sao_Paulo";

export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type WeeklyHours = Partial<Record<DayKey, [string, string] | null>>;

const WEEKDAY_MAP: Record<string, DayKey> = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

/** Extrai dia da semana e minutos-desde-meia-noite no fuso da clínica. */
function localParts(date: Date): { day: DayKey; minutes: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  let hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  if (hour === 24) hour = 0; // alguns ambientes formatam meia-noite como 24
  return { day: WEEKDAY_MAP[weekday] ?? "mon", minutes: hour * 60 + minute };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Offset (tz - UTC) em ms para o instante dado, via Intl. */
function tzOffsetMs(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) map[p.type] = p.value;
  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(+map.year, +map.month - 1, +map.day, hour, +map.minute, +map.second);
  return asUtc - date.getTime();
}

/**
 * Converte um horário wall-clock LOCAL (data + HH:MM no fuso da clínica) para
 * o instante UTC correspondente. Exato em fusos sem horário de verão (Brasil).
 */
export function zonedWallToUtc(dateStr: string, hhmm: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi, 0);
  const offset = tzOffsetMs(new Date(guess), CLINIC_TIMEZONE);
  return new Date(guess - offset);
}

/** Dia da semana (chave) de uma data YYYY-MM-DD (independente de fuso). */
export function dayKeyForDate(dateStr: string): DayKey {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const wd = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0)).getUTCDay();
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as DayKey[])[wd];
}

/** Gera horários candidatos (HH:MM) de `open` a `close`, passo `stepMin`, cabendo `durationMin`. */
export function slotTimes(open: string, close: string, durationMin: number, stepMin: number): string[] {
  const start = toMinutes(open);
  const end = toMinutes(close);
  const out: string[] = [];
  for (let t = start; t + durationMin <= end; t += stepMin) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

/** Faz o parse/normalização do Json do banco para WeeklyHours (defensivo). */
function normalizeHours(raw: unknown): WeeklyHours | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as WeeklyHours;
}

/**
 * Retorna true se o intervalo [start, end] cabe inteiramente dentro do horário
 * definido para aquele dia da semana (no fuso da clínica). Atendimentos que
 * cruzam a meia-noite local ou caem em dia fechado retornam false.
 */
export function isWithinHours(rawHours: unknown, start: Date, end: Date): boolean {
  const hours = normalizeHours(rawHours);
  if (!hours) return false;

  const s = localParts(start);
  const e = localParts(end);

  // Cruza a meia-noite (dias diferentes) — não suportado, considerado fora.
  if (s.day !== e.day) return false;

  const window = hours[s.day];
  if (!window || !Array.isArray(window) || window.length < 2) return false;

  const open = toMinutes(window[0]);
  const close = toMinutes(window[1]);
  return s.minutes >= open && e.minutes <= close;
}
