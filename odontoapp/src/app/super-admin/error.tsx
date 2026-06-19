"use client";

import { ErrorBox } from "@/components/ui/ErrorBox";

export default function SuperAdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorBox error={error} reset={reset} homeHref="/super-admin" homeLabel="Ir para o super-admin" />;
}
