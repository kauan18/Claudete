import Link from "next/link";
import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { createAppointmentManual } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";

export default async function NovoAgendamento() {
  const { clinicId } = await requireClinicSession();

  const [services, professionals] = await Promise.all([
    prisma.service.findMany({ where: { clinicId, active: true }, orderBy: { name: "asc" } }),
    prisma.professional.findMany({ where: { clinicId, active: true }, orderBy: { name: "asc" } }),
  ]);

  const noSetup = services.length === 0 || professionals.length === 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Novo Agendamento</h1>
        <p className="mt-1 text-ink-muted">Crie um agendamento manualmente (ex: ligação ou balcão)</p>
      </div>

      {noSetup ? (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-6 text-sm text-ink">
          <p className="font-medium">Cadastre os dados básicos primeiro.</p>
          <p className="mt-1 text-ink-muted">
            É preciso ter pelo menos{" "}
            {services.length === 0 && <Link href="/admin/servicos" className="font-medium text-primary hover:underline">um serviço</Link>}
            {services.length === 0 && professionals.length === 0 && " e "}
            {professionals.length === 0 && <Link href="/admin/profissionais" className="font-medium text-primary hover:underline">um profissional</Link>}
            {" "}ativo antes de criar um agendamento.
          </p>
        </div>
      ) : (
        <form action={createAppointmentManual} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nome do paciente *</label>
              <input name="patientName" required className={inputClass} placeholder="Ex: Maria Souza" />
            </div>

            <div>
              <label className={labelClass}>Telefone / WhatsApp *</label>
              <input name="patientPhone" required className={inputClass} placeholder="(11) 99999-9999" />
            </div>

            <div>
              <label className={labelClass}>E-mail</label>
              <input name="patientEmail" type="email" className={inputClass} placeholder="opcional" />
            </div>

            <div>
              <label className={labelClass}>Serviço *</label>
              <select name="serviceId" required defaultValue="" className={inputClass}>
                <option value="" disabled>Selecione...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMin}min)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Profissional *</label>
              <select name="professionalId" required defaultValue="" className={inputClass}>
                <option value="" disabled>Selecione...</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.specialty ? ` — ${p.specialty}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Data *</label>
              <input name="date" type="date" required className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Horário *</label>
              <input name="time" type="time" required step={300} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select name="status" defaultValue="confirmado" className={inputClass}>
                <option value="confirmado">Confirmado</option>
                <option value="solicitado">Solicitado</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Observações</label>
              <textarea name="notes" rows={3} className={`${inputClass} resize-none`} placeholder="Anotações internas (opcional)" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">Criar Agendamento</Button>
            <Button href="/admin/agendamentos" variant="outline">Cancelar</Button>
          </div>
        </form>
      )}
    </div>
  );
}
