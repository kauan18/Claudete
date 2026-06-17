import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateService } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass, checkboxClass } from "@/components/ui/form";

type Props = { params: Promise<{ id: string }> };

export default async function EditarServico({ params }: Props) {
  const { id } = await params;
  const { clinicId } = await requireClinicSession();

  const svc = await prisma.service.findFirst({ where: { id, clinicId } });
  if (!svc) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Editar Serviço</h1>
        <p className="mt-1 text-ink-muted">{svc.name}</p>
      </div>

      <form action={updateService} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
        <input type="hidden" name="id" value={svc.id} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nome do serviço *</label>
            <input name="name" required defaultValue={svc.name} className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Descrição</label>
            <textarea name="description" rows={3} defaultValue={svc.description ?? ""} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Duração (minutos) *</label>
            <input name="durationMin" type="number" required min={15} step={15} defaultValue={svc.durationMin} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Preço (R$)</label>
            <input name="price" type="number" step="0.01" min="0" defaultValue={svc.price ? Number(svc.price) : ""} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Categoria</label>
            <input name="category" defaultValue={svc.category ?? ""} className={inputClass} />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input type="hidden" name="active" value="false" />
            <input type="checkbox" name="active" value="true" id="active" defaultChecked={svc.active} className={checkboxClass} />
            <label htmlFor="active" className="text-sm text-ink">Serviço ativo</label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Salvar Alterações</Button>
          <Button href="/admin/servicos" variant="outline">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
