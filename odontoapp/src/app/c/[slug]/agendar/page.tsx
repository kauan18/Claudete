import { getClinicBySlug } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CalendarCheck, ShieldCheck, Clock } from "lucide-react";
import { Section, Container, SectionHeading } from "@/components/ui/Section";
import { AppointmentForm } from "@/components/public/AppointmentForm";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ servico?: string }> };

export default async function AgendarPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { servico: preSelectedServiceId } = await searchParams;

  const clinic = await getClinicBySlug(slug);
  if (!clinic) notFound();

  const [services, professionals] = await Promise.all([
    prisma.service.findMany({
      where: { clinicId: clinic.id, active: true },
      orderBy: { name: "asc" },
    }),
    prisma.professional.findMany({
      where: { clinicId: clinic.id, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const reassurance = [
    { Icon: CalendarCheck, title: "Sem compromisso", desc: "Você escolhe o melhor horário; confirmamos com você." },
    { Icon: Clock, title: "Resposta rápida", desc: "Entramos em contato para confirmar sua consulta." },
    { Icon: ShieldCheck, title: "Dados protegidos", desc: "Suas informações são usadas só para o agendamento (LGPD)." },
  ];

  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
          {/* Coluna de reforço */}
          <div className="lg:pt-4">
            <SectionHeading
              eyebrow="Agendamento online"
              title="Agendar Consulta"
              subtitle="Preencha o formulário e entraremos em contato para confirmar seu horário."
            />
            <ul className="mt-8 space-y-4">
              {reassurance.map(({ Icon, title, desc }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="text-sm text-ink-muted">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Formulário */}
          <AppointmentForm
            clinicId={clinic.id}
            slug={slug}
            services={services.map((s) => ({ id: s.id, name: s.name, durationMin: s.durationMin }))}
            professionals={professionals.map((p) => ({
              id: p.id,
              name: p.name,
              workingHours: p.workingHours as Record<string, string[]> | null,
            }))}
            businessHours={clinic.businessHours as Record<string, string[] | null> | null}
            preSelectedServiceId={preSelectedServiceId}
          />
        </div>
      </Container>
    </Section>
  );
}
