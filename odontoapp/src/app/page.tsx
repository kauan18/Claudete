import Link from "next/link";
import { CalendarCheck, MessageCircle, Bot, LayoutDashboard, ArrowRight, Star } from "lucide-react";
import { ToothMark } from "@/components/ui/ToothMark";

const features = [
  { Icon: CalendarCheck, title: "Agendamento online", desc: "Pacientes marcam consultas 24/7 com horários reais e sem conflitos." },
  { Icon: LayoutDashboard, title: "Painel administrativo", desc: "Gerencie agenda, serviços, profissionais e portfólio em um só lugar." },
  { Icon: MessageCircle, title: "WhatsApp integrado", desc: "Confirmações e lembretes automáticos pela Cloud API." },
  { Icon: Bot, title: "Assistente de IA", desc: "Atendimento inteligente que tira dúvidas e direciona ao agendamento." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-page">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-content px-6 py-24 text-center md:py-32">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <ToothMark className="h-7 w-7" />
          </span>
          <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight md:text-6xl">OdontoApp</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
            A plataforma completa para clínicas odontológicas: agendamento online, painel
            administrativo, WhatsApp e atendimento por IA.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/c/sorriso-perfeito"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-brand-ink shadow-lift transition-transform hover:-translate-y-0.5"
            >
              Ver demonstração
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white/60 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Acessar painel
            </Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/80">
            <Star className="h-4 w-4 fill-current" />
            Demonstração: clínica fictícia Sorriso Perfeito
          </p>
        </div>
      </section>

      {/* Recursos */}
      <section className="mx-auto max-w-content px-6 py-20 md:py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-tint text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
