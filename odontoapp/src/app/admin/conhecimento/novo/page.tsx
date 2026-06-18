import { createKnowledge } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass, checkboxClass } from "@/components/ui/form";

export default function NovaPergunta() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Nova Pergunta</h1>
        <p className="mt-1 text-ink-muted">Cadastre uma pergunta frequente e a resposta que o assistente deve dar</p>
      </div>

      <form action={createKnowledge} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
        <div>
          <label className={labelClass}>Pergunta *</label>
          <input name="question" required className={inputClass} placeholder="Ex: Vocês atendem convênio?" />
        </div>

        <div>
          <label className={labelClass}>Resposta *</label>
          <textarea name="answer" required rows={4} className={`${inputClass} resize-none`} placeholder="Resposta que o assistente deve usar" />
        </div>

        <div>
          <label className={labelClass}>Categoria</label>
          <input name="category" className={inputClass} placeholder="Ex: Pagamento, Agendamento, Serviços" />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input type="checkbox" name="active" value="true" id="active" defaultChecked className={checkboxClass} />
          <label htmlFor="active" className="text-sm text-ink">Ativa (usada pelo assistente)</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Criar Pergunta</Button>
          <Button href="/admin/conhecimento" variant="outline">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
