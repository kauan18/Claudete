/**
 * Utilitários de marca por tenant.
 *
 * O design system usa tokens semânticos baseados em CSS vars. A cor de cada
 * clínica (hex no banco) é convertida para uma tripla "r g b" e injetada como
 * `--brand` / `--brand-2` no escopo da clínica. Assim as utilities do Tailwind
 * (`bg-primary`, `text-primary/80`, `ring-primary/40`, ...) respeitam o tenant
 * e ainda suportam opacidade — sem `style={{ background: ... }}` espalhado.
 */

const FALLBACK_PRIMARY = "13 148 136"; // teal-600 — default premium
const FALLBACK_SECONDARY = "8 145 178"; // cyan-600

/** Converte "#0ea5e9" | "#0e9" → "14 165 233" (tripla RGB para uso em rgb(var(--brand) / a)). */
export function hexToRgbTriplet(hex: string | null | undefined, fallback: string): string {
  if (!hex) return fallback;
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return fallback;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Retorna o objeto de CSS vars para o escopo da clínica (usado no layout). */
export function brandVars(primary?: string | null, secondary?: string | null): React.CSSProperties {
  return {
    "--brand": hexToRgbTriplet(primary, FALLBACK_PRIMARY),
    "--brand-2": hexToRgbTriplet(secondary, FALLBACK_SECONDARY),
  } as React.CSSProperties;
}
