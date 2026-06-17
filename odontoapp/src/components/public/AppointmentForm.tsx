"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Service = { id: string; name: string; durationMin: number };
type Professional = {
  id: string;
  name: string;
  workingHours: Record<string, string[]> | null;
};

interface Props {
  clinicId: string;
  slug: string;
  services: Service[];
  professionals: Professional[];
  businessHours: Record<string, string[] | null> | null;
  preSelectedServiceId?: string;
}

type Slot = { time: string; iso: string };

const fieldBase =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted " +
  "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

const labelBase = "mb-2 block text-sm font-semibold text-ink";

export function AppointmentForm({
  clinicId,
  slug,
  services,
  professionals,
  preSelectedServiceId,
}: Props) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(preSelectedServiceId ?? "");
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState("");
  const [selectedIso, setSelectedIso] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // Busca os horários REALMENTE disponíveis no servidor (exclui conflitos e passado).
  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSelectedIso("");

    const params = new URLSearchParams({ clinicId, serviceId, date });
    if (professionalId) params.set("professionalId", professionalId);

    fetch(`/api/availability?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : { slots: [] }))
      .then((data) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clinicId, serviceId, professionalId, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Você precisa aceitar a política de privacidade.");
      return;
    }
    if (!selectedIso) {
      setError("Selecione um horário disponível.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clinicId,
        serviceId,
        professionalId,
        scheduledAt: selectedIso,
        patientName: name,
        patientPhone: phone,
        patientEmail: email,
        notes,
        lgpdConsent: consent,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao solicitar agendamento.");
      // O horário pode ter sido ocupado nesse meio tempo — recarrega os slots.
      setSelectedIso("");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-success/30 bg-success/10 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h2 className="font-display text-2xl font-bold text-ink">Solicitação enviada!</h2>
        <p className="max-w-sm text-ink-muted">
          Recebemos sua solicitação. Entraremos em contato para confirmar o agendamento.
        </p>
        <Button onClick={() => router.push(`/c/${slug}`)} className="mt-2">
          Voltar ao início
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
      {/* Passo 1 — Serviço */}
      <div>
        <label className={labelBase}>Serviço *</label>
        <select required value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={fieldBase}>
          <option value="">Selecione um serviço</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.durationMin} min)
            </option>
          ))}
        </select>
      </div>

      {/* Passo 2 — Profissional */}
      <div>
        <label className={labelBase}>Profissional</label>
        <select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} className={fieldBase}>
          <option value="">Qualquer profissional disponível</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Passo 3 — Data */}
      <div>
        <label className={labelBase}>Data *</label>
        <input
          type="date"
          required
          min={todayStr}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={fieldBase}
        />
      </div>

      {/* Passo 4 — Horário (slots reais do servidor) */}
      {date && serviceId && (
        <div>
          <label className={labelBase}>Horário *</label>
          {slotsLoading ? (
            <p className="flex items-center gap-2 py-2 text-sm text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando horários disponíveis…
            </p>
          ) : slots.length === 0 ? (
            <p className="py-2 text-sm text-ink-muted">Nenhum horário disponível nesta data. Tente outro dia.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => {
                const active = selectedIso === slot.iso;
                return (
                  <button
                    key={slot.iso}
                    type="button"
                    onClick={() => setSelectedIso(slot.iso)}
                    aria-pressed={active}
                    className={
                      "rounded-xl border py-2 text-sm font-medium transition-colors " +
                      (active
                        ? "border-transparent bg-primary text-white"
                        : "border-line text-ink hover:border-primary hover:text-primary")
                    }
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dados do paciente */}
      <div className="space-y-4 border-t border-line pt-6">
        <h3 className="text-sm font-semibold text-ink">Seus dados</h3>
        <input
          type="text"
          required
          placeholder="Nome completo *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldBase}
        />
        <input
          type="tel"
          required
          placeholder="WhatsApp / Telefone * (ex: 11999999999)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldBase}
        />
        <input
          type="email"
          placeholder="E-mail (opcional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldBase}
        />
        <textarea
          placeholder="Observações (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={`${fieldBase} resize-none`}
        />
      </div>

      {/* Consentimento LGPD */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[rgb(var(--brand))]"
        />
        <span className="text-sm text-ink-muted">
          Li e aceito a{" "}
          <a href="/privacidade" target="_blank" className="font-medium text-primary hover:underline">
            Política de Privacidade
          </a>
          . Autorizo o uso dos meus dados para fins de agendamento e comunicação sobre minha consulta.{" "}
          <span className="text-danger">*</span>
        </span>
      </label>

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading || !serviceId || !date || !selectedIso || !name || !phone || !consent}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Enviando…
          </>
        ) : (
          "Solicitar Agendamento"
        )}
      </Button>
    </form>
  );
}
