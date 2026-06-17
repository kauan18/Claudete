import Link from "next/link";
import { createService } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass, checkboxClass } from "@/components/ui/form";

export default function NovoServico() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Novo Serviço</h1>
        <p className="mt-1 text-ink-muted">Preencha os dados do serviço</p>
      </div>

      <form action={createService} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nome do serviço *</label>
            <input name="name" required className={inputClass} placeholder="Ex: Clareamento Dental" />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Descrição</label>
            <textarea name="description" rows={3} className={`${inputClass} resize-none`} placeholder="Descreva o serviço para os pacientes" />
          </div>

          <div>
            <label className={labelClass}>Duração (minutos) *</label>
            <input name="durationMin" type="number" required min={15} step={15} defaultValue={60} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Preço (R$)</label>
            <input name="price" type="number" step="0.01" min="0" className={inputClass} placeholder="Deixe vazio para 'Consultar'" />
          </div>

          <div>
            <label className={labelClass}>Categoria</label>
            <input name="category" className={inputClass} placeholder="Ex: Estética, Preventivo" />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" name="active" value="true" id="active" defaultChecked className={checkboxClass} />
            <label htmlFor="active" className="text-sm text-ink">Serviço ativo (visível no site)</label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Criar Serviço</Button>
          <Button href="/admin/servicos" variant="outline">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
