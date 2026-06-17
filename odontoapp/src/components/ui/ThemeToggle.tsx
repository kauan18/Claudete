"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Interruptor horizontal de tema claro/escuro.
 * - Track em pílula com knob deslizante; o ícone dentro do knob mostra o tema ATUAL,
 *   e o ícone-alvo aparece esmaecido na outra ponta.
 * - Alterna a classe `dark` no <html> e persiste em localStorage.
 * - Liga a classe `theme-transition` por ~0.5s para animar as cores suavemente.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
    window.setTimeout(() => root.classList.remove("theme-transition"), 500);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={toggle}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={dark ? "Modo claro" : "Modo escuro"}
      className={cn(
        "relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border border-line transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page",
        dark ? "bg-primary/20" : "bg-subtle",
        className,
      )}
    >
      {/* Ícones-alvo nas pontas (esmaecidos; o do lado ativo fica sob o knob) */}
      <Sun className="pointer-events-none absolute left-[7px] h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
      <Moon className="pointer-events-none absolute right-[7px] h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />

      {/* Knob deslizante com o ícone do tema atual */}
      <span
        className={cn(
          "absolute left-[2px] flex h-6 w-6 items-center justify-center rounded-full bg-surface shadow-soft",
          mounted && "transition-transform duration-300 ease-out",
          dark ? "translate-x-[24px]" : "translate-x-0",
        )}
      >
        {dark ? (
          <Moon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
