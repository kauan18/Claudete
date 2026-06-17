import { createProfessional } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function NovoProfissional() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">Novo Profissional</h1>

      <form action={createProfessional} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
        <div>
          <label className={labelClass}>Nome completo *</label>
          <input name="name" required className={inputClass} placeholder="Dr(a). Nome Sobrenome" />
        </div>
        <div>
          <label className={labelClass}>Especialidade</label>
          <input name="specialty" className={inputClass} placeholder="Ex: Ortodontia e Estética" />
        </div>
        <div>
          <label className={labelClass}>Bio / Apresentação</label>
          <textarea name="bio" rows={4} className={`${inputClass} resize-none`} placeholder="Descreva a formação e experiência do profissional" />
        </div>
        <div className="max-w-xs">
          <ImageUpload name="photo" label="Foto do profissional" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Cadastrar Profissional</Button>
          <Button href="/admin/profissionais" variant="outline">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
