import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updatePortfolioItem } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass, checkboxClass } from "@/components/ui/form";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Props = { params: Promise<{ id: string }> };

export default async function EditarCaso({ params }: Props) {
  const { id } = await params;
  const { clinicId } = await requireClinicSession();

  const item = await prisma.portfolioItem.findFirst({ where: { id, clinicId } });
  if (!item) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Editar Caso</h1>
        <p className="mt-1 text-ink-muted">{item.title}</p>
      </div>

      <form action={updatePortfolioItem} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
        <input type="hidden" name="id" value={item.id} />

        <div>
          <label className={labelClass}>Título *</label>
          <input name="title" required defaultValue={item.title} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Descrição</label>
          <textarea name="description" rows={3} defaultValue={item.description ?? ""} className={`${inputClass} resize-none`} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ImageUpload name="imageBefore" label="Foto — Antes" defaultValue={item.imageBefore} />
          <ImageUpload name="imageAfter" label="Foto — Depois" defaultValue={item.imageAfter} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Categoria</label>
            <input name="category" defaultValue={item.category ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Ordem de exibição</label>
            <input name="order" type="number" defaultValue={item.order} className={inputClass} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input type="checkbox" name="active" value="true" id="active" defaultChecked={item.active} className={checkboxClass} />
          <label htmlFor="active" className="text-sm text-ink">Caso ativo (visível no site)</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Salvar Alterações</Button>
          <Button href="/admin/portfolio" variant="outline">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
