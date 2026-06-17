import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { deleteKnowledge, toggleKnowledge } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { Button } from "@/components/ui/Button";
import { getPlan } from "@/lib/plans";

export default async function ConhecimentoPage() {
  const { clinicId } = await requireClinicSession();

  const [items, clinic] = await Promise.all([
    prisma.knowledgeBase.findMany({ where: { clinicId }, orderBy: [{ category: "asc" }, { createdAt: "asc" }] }),
    prisma.clinic.findUnique({ where: { id: clinicId }, select: { plan: true } }),
  ]);

  const hasAI = getPlan(clinic?.plan).ai;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Base de Conhecimento</h1>
          <p className="mt-1 text-ink-muted">{items.length} pergunta(s) — usada pelo assistente de IA e pelas respostas automáticas</p>
        </div>
        <Button href="/admin/conhecimento/novo" size="sm">
          <Plus className="h-4 w-4" />
          Nova Pergunta
        </Button>
      </div>

      {!hasAI && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-ink">
          O assistente de IA está disponível no plano <strong>Premium</strong>. Você pode cadastrar as perguntas agora —
          elas serão usadas assim que ativar a IA. <Link href="/planos" className="font-medium text-primary hover:underline">Ver planos</Link>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface py-16 text-center text-ink-muted shadow-soft">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-ink-muted" />
          <p>Nenhuma pergunta cadastrada.</p>
          <Link href="/admin/conhecimento/novo" className="mt-3 inline-block text-sm font-medium text-primary hover:text-brand-ink">
            Cadastrar primeira pergunta →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {item.category && (
                    <span className="mb-1.5 inline-block rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-semibold text-brand-ink">
                      {item.category}
                    </span>
                  )}
                  <h3 className="font-display font-semibold text-ink">{item.question}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.answer}</p>
                </div>
                <form action={toggleKnowledge}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="active" value={String(!item.active)} />
                  <button
                    type="submit"
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      item.active ? "bg-success/15 text-success hover:bg-success/25" : "bg-subtle text-ink-muted hover:bg-line"
                    }`}
                  >
                    {item.active ? "Ativo" : "Inativo"}
                  </button>
                </form>
              </div>
              <div className="mt-3 flex items-center gap-4 border-t border-line pt-3 text-sm">
                <Link href={`/admin/conhecimento/${item.id}`} className="font-medium text-primary hover:text-brand-ink">
                  Editar
                </Link>
                <form action={deleteKnowledge} className="inline">
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmSubmitButton confirmMessage="Remover esta pergunta?" className="font-medium text-danger hover:underline">
                    Remover
                  </ConfirmSubmitButton>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
