import Link from "next/link";
import { ToothMark } from "@/components/ui/ToothMark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-6">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
          <ToothMark className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-display text-5xl font-extrabold text-ink">404</h1>
        <p className="mt-2 text-ink-muted">Página não encontrada.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
