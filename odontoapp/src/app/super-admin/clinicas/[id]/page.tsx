import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireSuperAdmin } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { updateClinic } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";
import { PLANS, PLAN_ORDER } from "@/lib/plans";

type Props = { params: Promise<{ id: string }> };

export default async function EditarClinica({ params }: Props) {
  await requireSuperAdmin();
  const { id } = await params;

  const clinic = await prisma.clinic.findUnique({ where: { id } });
  if (!clinic) notFound();

  return (
    <div className="min-h-screen bg-page p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/super-admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Editar Clínica</h1>
            <p className="mt-1 text-ink-muted">{clinic.name}</p>
          </div>
          <Link
            href={`/c/${clinic.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-primary hover:text-brand-ink"
          >
            Ver página <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <form action={updateClinic} className="space-y-6">
          <input type="hidden" name="id" value={clinic.id} />

          <section className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-soft">
            <h2 className="font-display font-semibold text-ink">Dados da Clínica</h2>

            <div>
              <label className={labelClass}>Nome da clínica *</label>
              <input name="name" required defaultValue={clinic.name} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Slug (URL pública) *</label>
              <input name="slug" required defaultValue={clinic.slug} className={inputClass} />
              <p className="mt-1 text-xs text-ink-muted">Página pública: <span className="font-mono">/c/{clinic.slug}</span></p>
            </div>

            <div>
              <label className={labelClass}>Plano</label>
              <select name="plan" defaultValue={clinic.plan} className={inputClass}>
                {PLAN_ORDER.map((id) => (
                  <option key={id} value={id}>
                    {PLANS[id].name} — R$ {PLANS[id].price}/mês
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Cor primária</label>
                <input name="primaryColor" type="color" defaultValue={clinic.primaryColor} className="h-11 w-full cursor-pointer rounded-xl border border-line bg-surface px-2" />
              </div>
              <div>
                <label className={labelClass}>Cor secundária</label>
                <input name="secondaryColor" type="color" defaultValue={clinic.secondaryColor} className="h-11 w-full cursor-pointer rounded-xl border border-line bg-surface px-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Telefone</label>
                <input name="phone" defaultValue={clinic.phone ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp (com DDI)</label>
                <input name="whatsapp" defaultValue={clinic.whatsapp ?? ""} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>E-mail de contato</label>
              <input name="email" type="email" defaultValue={clinic.email ?? ""} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Endereço</label>
              <input name="address" defaultValue={clinic.address ?? ""} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Descrição</label>
              <textarea name="description" rows={3} defaultValue={clinic.description ?? ""} className={`${inputClass} resize-none`} />
            </div>
          </section>

          <div className="flex gap-3">
            <Button type="submit">Salvar Alterações</Button>
            <Button href="/super-admin" variant="outline">Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
