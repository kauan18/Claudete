import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireSuperAdmin } from "@/lib/tenant";
import { createClinic } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";

export default async function NovaClinica() {
  await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-page p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/super-admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Nova Clínica</h1>
          <p className="mt-1 text-ink-muted">Cadastre uma clínica e o usuário responsável por ela</p>
        </div>

        <form action={createClinic} className="space-y-6">
          <section className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-soft">
            <h2 className="font-display font-semibold text-ink">Dados da Clínica</h2>

            <div>
              <label className={labelClass}>Nome da clínica *</label>
              <input name="name" required className={inputClass} placeholder="Ex: Clínica Sorriso Perfeito" />
            </div>

            <div>
              <label className={labelClass}>Slug (URL pública)</label>
              <input name="slug" className={inputClass} placeholder="deixe vazio para gerar do nome" />
              <p className="mt-1 text-xs text-ink-muted">A página pública ficará em <span className="font-mono">/c/&lt;slug&gt;</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Cor primária</label>
                <input name="primaryColor" type="color" defaultValue="#0ea5e9" className="h-11 w-full cursor-pointer rounded-xl border border-line bg-surface px-2" />
              </div>
              <div>
                <label className={labelClass}>Cor secundária</label>
                <input name="secondaryColor" type="color" defaultValue="#0369a1" className="h-11 w-full cursor-pointer rounded-xl border border-line bg-surface px-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Telefone</label>
                <input name="phone" className={inputClass} placeholder="(11) 3456-7890" />
              </div>
              <div>
                <label className={labelClass}>WhatsApp (com DDI)</label>
                <input name="whatsapp" className={inputClass} placeholder="5511999999999" />
              </div>
            </div>

            <div>
              <label className={labelClass}>E-mail de contato</label>
              <input name="email" type="email" className={inputClass} placeholder="contato@clinica.com.br" />
            </div>

            <div>
              <label className={labelClass}>Endereço</label>
              <input name="address" className={inputClass} placeholder="Rua, número, bairro, cidade" />
            </div>

            <div>
              <label className={labelClass}>Descrição</label>
              <textarea name="description" rows={3} className={`${inputClass} resize-none`} placeholder="Breve descrição da clínica (aparece no site público)" />
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-soft">
            <div>
              <h2 className="font-display font-semibold text-ink">Usuário Responsável (Admin)</h2>
              <p className="mt-1 text-sm text-ink-muted">Quem vai acessar o painel desta clínica.</p>
            </div>

            <div>
              <label className={labelClass}>Nome *</label>
              <input name="adminName" required className={inputClass} placeholder="Ex: Dra. Ana Lima" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>E-mail de acesso *</label>
                <input name="adminEmail" type="email" required className={inputClass} placeholder="admin@clinica.com.br" />
              </div>
              <div>
                <label className={labelClass}>Senha inicial *</label>
                <input name="adminPassword" type="text" required minLength={6} className={inputClass} placeholder="mínimo 6 caracteres" />
              </div>
            </div>
            <p className="text-xs text-ink-muted">Anote a senha e repasse ao responsável — ele poderá alterá-la depois.</p>
          </section>

          <div className="flex gap-3">
            <Button type="submit">Criar Clínica</Button>
            <Button href="/super-admin" variant="outline">Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
