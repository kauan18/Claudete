"use client";

import { useEffect, useState } from "react";

/**
 * Botão de alternância de tema claro/escuro.
 * - Alterna a classe `dark` no <html> e persiste em localStorage.
 * - Liga a classe `theme-transition` por ~0.5s para animar as cores suavemente.
 * - Os ícones de sol/lua fazem crossfade com rotação ao clicar.
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
      onClick={toggle}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={dark ? "Modo claro" : "Modo escuro"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700 ${className}`}
    >
      {/* Sol (visível no modo claro) */}
      <svg
        viewBox="0 0 24 24"
        className={`absolute h-5 w-5 fill-none stroke-current transition-all duration-500 ${
          mounted && dark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      {/* Lua (visível no modo escuro) */}
      <svg
        viewBox="0 0 24 24"
        className={`absolute h-5 w-5 fill-current transition-all duration-500 ${
          mounted && dark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        }`}
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    </button>
  );
}
