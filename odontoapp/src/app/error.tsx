"use client";

import { ErrorBox } from "@/components/ui/ErrorBox";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorBox error={error} reset={reset} homeHref="/" homeLabel="Voltar ao início" />;
}
