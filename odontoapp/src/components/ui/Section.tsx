import { cn } from "@/lib/cn";

/** Container central com largura e padding horizontal padronizados. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full max-w-content px-6", className)}>{children}</div>;
}

/** Seção com ritmo vertical consistente (py-20 → md:py-28). */
export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-20 md:py-28", className)}>
      {children}
    </section>
  );
}

/** Rótulo "eyebrow" acima dos títulos de seção. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Cabeçalho de seção padronizado (eyebrow + título + subtítulo). */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h2>
      {subtitle && <p className="text-lg leading-relaxed text-ink-muted">{subtitle}</p>}
    </div>
  );
}

/** Card base com superfície, borda e sombra suaves. */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}
