import { ToothMark } from "./ToothMark";
import { cn } from "@/lib/cn";

/**
 * Marca da clínica: usa o logo enviado (se houver) ou um selo com o ícone de
 * dente sobre fundo da cor da marca. Reutilizado no header, footer e chat.
 */
export function Logo({
  name,
  logo,
  showName = true,
  className,
}: {
  name: string;
  logo?: string | null;
  showName?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {logo ? (
        <img src={logo} alt={name} className="h-9 w-auto" loading="eager" decoding="async" />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
          <ToothMark className="h-5 w-5" />
        </span>
      )}
      {showName && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">{name}</span>
      )}
    </span>
  );
}
