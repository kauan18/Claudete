import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { updateClinicSettings } from "./actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";

export default async function ConfiguracoesPage() {
  const { clinicId } = await requireClinicSession();

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Configurações da Clínica</h1>
        <p className="mt-1 text-ink-muted">Dados públicos e integrações</p>
      </div>

      <form action={updateClinicSettings} className="space-y-6">
        <input type="hidden" name="clinicId" value={clinicId} />

        <section className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="font-display font-semibold text-ink">Dados da Clínica</h2>

          <Field label="Nome da clínica *" name="name" defaultValue={clinic.name} required />
          <Field label="Slug (URL pública)" name="slug" defaultValue={clinic.slug} required hint={`/c/${clinic.slug}`} />
          <Field label="Descrição" name="description" defaultValue={clinic.description ?? ""} textarea />
          <Field label="Endereço" name="address" defaultValue={clinic.address ?? ""} />
          <Field label="Telefone" name="phone" defaultValue={clinic.phone ?? ""} />
          <Field label="WhatsApp (número com DDI, ex: 5511999999999)" name="whatsapp" defaultValue={clinic.whatsapp ?? ""} />
          <Field label="E-mail de contato" name="email" type="email" defaultValue={clinic.email ?? ""} />
        </section>

        <section className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="font-display font-semibold text-ink">Redes Sociais</h2>
          <Field label="Instagram (URL)" name="instagram" defaultValue={clinic.instagram ?? ""} />
          <Field label="Facebook (URL)" name="facebook" defaultValue={clinic.facebook ?? ""} />
          <Field label="Website" name="website" defaultValue={clinic.website ?? ""} />
        </section>

        <section className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="font-display font-semibold text-ink">Agendamento</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Intervalo automático entre consultas (min)" name="appointmentBuffer" type="number" defaultValue={String(clinic.appointmentBuffer)} />
            <Field label="Cancelamento mínimo (horas)" name="cancelMinHours" type="number" defaultValue={String(clinic.cancelMinHours)} />
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="font-display font-semibold text-ink">WhatsApp Cloud API (opcional)</h2>
          <p className="text-sm text-ink-muted">Preencha para envio automático de confirmações e lembretes via API oficial.</p>
          <Field label="Token de acesso" name="waToken" defaultValue={clinic.waToken ?? ""} type="password" />
          <Field label="Phone Number ID" name="waPhoneNumberId" defaultValue={clinic.waPhoneNumberId ?? ""} />
          <Field label="Business Account ID" name="waBusinessAccount" defaultValue={clinic.waBusinessAccount ?? ""} />
        </section>

        <Button type="submit" size="lg">Salvar Configurações</Button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  hint,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} rows={3} className={`${inputClass} resize-none`} />
      ) : (
        <input name={name} type={type} defaultValue={defaultValue} required={required} className={inputClass} />
      )}
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
