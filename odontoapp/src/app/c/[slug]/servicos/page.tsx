import { getClinicBySlug } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Section, Container, SectionHeading } from "@/components/ui/Section";
import { ServiceCard } from "@/components/public/ServiceCard";

type Props = { params: Promise<{ slug: string }> };

export default async function ServicosPage({ params }: Props) {
  const { slug } = await params;
  const clinic = await getClinicBySlug(slug);
  if (!clinic) notFound();

  const services = await prisma.service.findMany({
    where: { clinicId: clinic.id, active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const categories = [...new Set(services.map((s) => s.category).filter(Boolean))] as string[];
  const toCard = (s: (typeof services)[number]) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    durationMin: s.durationMin,
    price: s.price != null ? Number(s.price) : null,
    category: s.category,
  });

  return (
    <Section>
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Tratamentos"
          title="Nossos Serviços"
          subtitle={`Conheça todos os tratamentos disponíveis na ${clinic.name}.`}
        />

        <div className="mt-16 space-y-16">
          {categories.length > 0 ? (
            categories.map((cat) => {
              const catServices = services.filter((s) => s.category === cat);
              return (
                <div key={cat}>
                  <h2 className="flex items-center gap-3 font-display text-xl font-bold text-ink">
                    <span className="h-6 w-1.5 rounded-full bg-primary" />
                    {cat}
                  </h2>
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {catServices.map((svc) => (
                      <ServiceCard key={svc.id} svc={toCard(svc)} slug={slug} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((svc) => (
                <ServiceCard key={svc.id} svc={toCard(svc)} slug={slug} />
              ))}
            </div>
          ) : (
            <p className="py-20 text-center text-ink-muted">Nenhum serviço cadastrado ainda.</p>
          )}
        </div>
      </Container>
    </Section>
  );
}
