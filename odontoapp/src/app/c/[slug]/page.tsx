import { getClinicBySlug } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Microscope,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  CalendarCheck,
  ArrowRight,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  UserRound,
  Clock,
} from "lucide-react";
import { Section, Container, SectionHeading } from "@/components/ui/Section";
import { ServiceCard } from "@/components/public/ServiceCard";

type Props = { params: Promise<{ slug: string }> };

export default async function ClinicHomePage({ params }: Props) {
  const { slug } = await params;
  const clinic = await getClinicBySlug(slug);
  if (!clinic) notFound();

  const [services, professionals] = await Promise.all([
    prisma.service.findMany({
      where: { clinicId: clinic.id, active: true },
      take: 6,
      orderBy: { createdAt: "asc" },
    }),
    prisma.professional.findMany({
      where: { clinicId: clinic.id, active: true },
    }),
  ]);

  const hours = clinic.businessHours as Record<string, string[] | null> | null;
  const dayNames: Record<string, string> = {
    mon: "Segunda", tue: "Terça", wed: "Quarta", thu: "Quinta",
    fri: "Sexta", sat: "Sábado", sun: "Domingo",
  };
  const dayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  const trust = [
    { Icon: ShieldCheck, label: "Profissionais especialistas" },
    { Icon: Sparkles, label: "Tecnologia moderna" },
    { Icon: HeartHandshake, label: "Atendimento humanizado" },
  ];

  const diferenciais = [
    { Icon: Award, title: "Excelência Clínica", desc: "Profissionais especialistas com anos de experiência e formação contínua." },
    { Icon: Microscope, title: "Tecnologia Avançada", desc: "Equipamentos modernos para diagnóstico preciso e tratamentos confortáveis." },
    { Icon: HeartHandshake, title: "Cuidado Humanizado", desc: "Atendimento acolhedor que prioriza seu conforto e bem-estar em cada visita." },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent text-white">
        {/* Decorações suaves */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
        </div>

        <Container className="relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur">
              <Star className="h-4 w-4 fill-current" />
              Sua saúde bucal em primeiro lugar
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              {clinic.name}
            </h1>
            {clinic.description && (
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
                {clinic.description}
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/c/${slug}/agendar`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-brand-ink shadow-lift transition-transform hover:-translate-y-0.5"
              >
                <CalendarCheck className="h-5 w-5" />
                Agendar Consulta
              </Link>
              {clinic.whatsapp && (
                <a
                  href={`https://wa.me/${clinic.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-white/60 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              )}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {trust.map(({ Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 text-sm font-medium text-white/85">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Diferenciais ── */}
      <Section>
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Por que nos escolher"
            title="Um cuidado completo com você"
            subtitle="Combinamos técnica, tecnologia e empatia para entregar a melhor experiência odontológica."
          />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {diferenciais.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-line bg-surface p-8 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-card"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-6 font-display text-xl font-bold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Serviços em destaque ── */}
      {services.length > 0 && (
        <Section className="bg-subtle">
          <Container>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Tratamentos"
                title="Nossos Serviços"
                subtitle="Cuidado completo para a sua saúde bucal, do preventivo ao estético."
              />
              <Link
                href={`/c/${slug}/servicos`}
                className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary transition-colors hover:text-brand-ink"
              >
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((svc) => (
                <ServiceCard
                  key={svc.id}
                  slug={slug}
                  svc={{
                    id: svc.id,
                    name: svc.name,
                    description: svc.description,
                    durationMin: svc.durationMin,
                    price: svc.price != null ? Number(svc.price) : null,
                    category: svc.category,
                  }}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── Equipe ── */}
      {professionals.length > 0 && (
        <Section>
          <Container>
            <SectionHeading
              eyebrow="Nossa equipe"
              title="Profissionais dedicados ao seu sorriso"
              subtitle="Conheça quem vai cuidar de você com atenção e responsabilidade."
            />
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map((pro) => (
                <div
                  key={pro.id}
                  className="rounded-2xl border border-line bg-surface p-6 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-brand-tint">
                    {pro.photo ? (
                      <img
                        src={pro.photo}
                        alt={pro.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-primary">
                        <UserRound className="h-10 w-10" />
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink">{pro.name}</h3>
                  {pro.specialty && <p className="mt-1 text-sm font-medium text-primary">{pro.specialty}</p>}
                  {pro.bio && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">{pro.bio}</p>}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── Contato / Horários ── */}
      <Section className="bg-subtle">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Fale conosco" title="Informações de contato" />
              <ul className="mt-8 space-y-5 text-ink-muted">
                {clinic.address && (
                  <li className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-primary">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span className="self-center">{clinic.address}</span>
                  </li>
                )}
                {clinic.phone && (
                  <li className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-primary">
                      <Phone className="h-5 w-5" />
                    </span>
                    <a href={`tel:${clinic.phone}`} className="self-center transition-colors hover:text-primary">
                      {clinic.phone}
                    </a>
                  </li>
                )}
                {clinic.whatsapp && (
                  <li className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-primary">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    <a
                      href={`https://wa.me/${clinic.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="self-center transition-colors hover:text-primary"
                    >
                      Chamar no WhatsApp
                    </a>
                  </li>
                )}
                {clinic.email && (
                  <li className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-primary">
                      <Mail className="h-5 w-5" />
                    </span>
                    <a href={`mailto:${clinic.email}`} className="self-center break-all transition-colors hover:text-primary">
                      {clinic.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {hours && (
              <div>
                <SectionHeading eyebrow="Atendimento" title="Horário de funcionamento" />
                <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                  {dayOrder.map((day) => {
                    const open = hours[day];
                    return (
                      <li key={day} className="flex items-center justify-between px-5 py-3.5 text-sm">
                        <span className="inline-flex items-center gap-2 font-medium text-ink">
                          <Clock className="h-4 w-4 text-ink-muted" />
                          {dayNames[day]}
                        </span>
                        <span className={open ? "font-medium text-ink" : "text-ink-muted"}>
                          {open ? `${open[0]} – ${open[1]}` : "Fechado"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* ── CTA final ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>
        <Container className="relative py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white ring-1 ring-white/25">
            Vamos começar
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-bold md:text-4xl">
            Pronto para cuidar do seu sorriso?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            Agende sua consulta agora mesmo. É rápido, simples e online.
          </p>
          <Link
            href={`/c/${slug}/agendar`}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-10 text-base font-semibold text-brand-ink shadow-lift transition-transform hover:-translate-y-0.5"
          >
            <CalendarCheck className="h-5 w-5" />
            Agendar Agora
          </Link>
        </Container>
      </section>
    </>
  );
}
