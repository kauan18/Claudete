"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * UI de erro reutilizável pelos error boundaries (error.tsx) de cada área.
 * Mostra uma mensagem amigável + botão "tentar novamente" (reset) e um link
 * de volta, em vez da tela técnica padrão do Next.
 */
export function ErrorBox({
  error,
  reset,
  homeHref = "/",
  homeLabel = "Voltar ao início",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref?: string;
  homeLabel?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/15 text-danger">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h1 className="font-display text-2xl font-bold text-ink">Algo deu errado</h1>
      <p className="max-w-md text-ink-muted">
        Tivemos um problema ao processar sua solicitação. Tente novamente em instantes — se persistir, recarregue a página.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-ink"
        >
          <RotateCw className="h-4 w-4" />
          Tentar novamente
        </button>
        <Link
          href={homeHref}
          className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-subtle"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
