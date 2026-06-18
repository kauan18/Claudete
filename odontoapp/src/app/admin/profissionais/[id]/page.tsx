import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateProfessional } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass, checkboxClass } from "@/components/ui/form";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Props = { params: Promise<{ id: string }> };

export default async function EditarProfissional({ params }: Props) {
  const { id } = await params;
  const { clinicId } = await requireClinicSession();

  const pro = await prisma.professional.findFirst({ where: { id, clinicId } });
  if (!pro) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">Editar Profissional</h1>

      <form action={updateProfessional} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
        <input type="hidden" name="id" value={pro.id} />

        <div>
          <label className={labelClass}>Nome completo *</label>
          <input name="name" required defaultValue={pro.name} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Especialidade</label>
          <input name="specialty" defaultValue={pro.specialty ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bio</label>
          <textarea name="bio" rows={4} defaultValue={pro.bio ?? ""} className={`${inputClass} resize-none`} />
        </div>
        <div className="max-w-xs">
          <ImageUpload name="photo" label="Foto do profissional" defaultValue={pro.photo} />
        </div>
        <div className="flex items-center gap-3">
          <input type="hidden" name="active" value="false" />
          <input type="checkbox" name="active" value="true" id="active" defaultChecked={pro.active} className={checkboxClass} />
          <label htmlFor="active" className="text-sm text-ink">Profissional ativo</label>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Salvar</Button>
          <Button href="/admin/profissionais" variant="outline">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
