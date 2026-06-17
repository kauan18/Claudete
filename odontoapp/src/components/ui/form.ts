/**
 * Classes padronizadas de formulário (admin + público).
 * Usam tokens semânticos → funcionam em claro/escuro sem `dark:`.
 */

export const inputClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink " +
  "placeholder:text-ink-muted transition-colors focus:border-primary focus:outline-none " +
  "focus:ring-2 focus:ring-primary/30";

export const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export const checkboxClass = "h-4 w-4 rounded accent-[rgb(var(--brand))]";
