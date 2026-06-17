import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateKnowledge } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass, checkboxClass } from "@/components/ui/form";

type Props = { params: Promise<{ id: string }> };

export default async function EditarPergunta({ params }: Props) {
  const { id } = await params;
  const { clinicId } = await requireClinicSession();

  const item = await prisma.knowledgeBase.findFirst({ where: { id, clinicId } });
  if (!item) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Editar Pergunta</h1>
        <p className="mt-1 line-clamp-1 text-ink-muted">{item.question}</p>
      </div>

      <form action={updateKnowledge} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
        <input type="hidden" name="id" value={item.id} />

        <div>
          <label className={labelClass}>Pergunta *</label>
          <input name="question" required defaultValue={item.question} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Resposta *</label>
          <textarea name="answer" required rows={4} defaultValue={item.answer} className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className={labelClass}>Categoria</label>
          <input name="category" defaultValue={item.category ?? ""} className={inputClass} />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input type="checkbox" name="active" value="true" id="active" defaultChecked={item.active} className={checkboxClass} />
          <label htmlFor="active" className="text-sm text-ink">Ativa (usada pelo assistente)</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Salvar Alterações</Button>
          <Button href="/admin/conhecimento" variant="outline">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
