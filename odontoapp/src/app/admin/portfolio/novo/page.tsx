import { createPortfolioItem } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass, checkboxClass } from "@/components/ui/form";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function NovoCaso() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Novo Caso</h1>
        <p className="mt-1 text-ink-muted">Cadastre um caso de antes e depois para o portfólio</p>
      </div>

      <form action={createPortfolioItem} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
        <div>
          <label className={labelClass}>Título *</label>
          <input name="title" required className={inputClass} placeholder="Ex: Clareamento Dental — Resultado Imediato" />
        </div>

        <div>
          <label className={labelClass}>Descrição</label>
          <textarea
            name="description"
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Conte o caso: o que foi feito, em quanto tempo, resultado..."
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ImageUpload name="imageBefore" label="Foto — Antes" />
          <ImageUpload name="imageAfter" label="Foto — Depois" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Categoria</label>
            <input name="category" className={inputClass} placeholder="Ex: Estética, Implante, Ortodontia" />
          </div>
          <div>
            <label className={labelClass}>Ordem de exibição</label>
            <input name="order" type="number" defaultValue={0} className={inputClass} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input type="checkbox" name="active" value="true" id="active" defaultChecked className={checkboxClass} />
          <label htmlFor="active" className="text-sm text-ink">Caso ativo (visível no site)</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Criar Caso</Button>
          <Button href="/admin/portfolio" variant="outline">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
