import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Images, ImageOff } from "lucide-react";
import { deletePortfolioItem, togglePortfolioItem } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { Button } from "@/components/ui/Button";

export default async function PortfolioPage() {
  const { clinicId } = await requireClinicSession();

  const items = await prisma.portfolioItem.findMany({
    where: { clinicId },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Portfólio</h1>
          <p className="mt-1 text-ink-muted">{items.length} caso(s) cadastrado(s)</p>
        </div>
        <Button href="/admin/portfolio/novo" size="sm">
          <Plus className="h-4 w-4" />
          Novo Caso
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface py-16 text-center text-ink-muted shadow-soft">
          <Images className="mx-auto mb-3 h-10 w-10 text-ink-muted" />
          <p>Nenhum caso publicado ainda.</p>
          <Link
            href="/admin/portfolio/novo"
            className="mt-3 inline-block text-sm font-medium text-primary hover:text-brand-ink"
          >
            Cadastrar primeiro caso →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft"
            >
              <div className="grid grid-cols-2 gap-px bg-line">
                <Thumb src={item.imageBefore} label="Antes" />
                <Thumb src={item.imageAfter} label="Depois" />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold leading-tight text-ink">{item.title}</h3>
                  <form action={togglePortfolioItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="active" value={String(!item.active)} />
                    <button
                      type="submit"
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        item.active
                          ? "bg-success/15 text-success hover:bg-success/25"
                          : "bg-subtle text-ink-muted hover:bg-line"
                      }`}
                    >
                      {item.active ? "Ativo" : "Inativo"}
                    </button>
                  </form>
                </div>

                {item.category && (
                  <span className="mt-2 w-fit rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-semibold text-brand-ink">
                    {item.category}
                  </span>
                )}

                {item.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{item.description}</p>
                )}

                <div className="mt-auto flex items-center gap-4 pt-4 text-sm">
                  <Link
                    href={`/admin/portfolio/${item.id}`}
                    className="font-medium text-primary hover:text-brand-ink"
                  >
                    Editar
                  </Link>
                  <form action={deletePortfolioItem} className="inline">
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmSubmitButton
                      confirmMessage="Remover este caso do portfólio?"
                      className="font-medium text-danger hover:underline"
                    >
                      Remover
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Thumb({ src, label }: { src: string | null; label: string }) {
  return (
    <div className="relative aspect-square bg-subtle">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink-muted">
          <ImageOff className="h-5 w-5" />
          <span className="text-[11px]">{label}</span>
        </span>
      )}
      <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}
