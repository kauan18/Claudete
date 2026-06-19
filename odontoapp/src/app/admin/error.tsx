"use client";

import { ErrorBox } from "@/components/ui/ErrorBox";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorBox error={error} reset={reset} homeHref="/admin" homeLabel="Ir para o painel" />;
}
