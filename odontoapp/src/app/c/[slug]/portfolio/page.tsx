import { getClinicBySlug } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ImageOff } from "lucide-react";
import { Section, Container, SectionHeading } from "@/components/ui/Section";

type Props = { params: Promise<{ slug: string }> };

export default async function PortfolioPage({ params }: Props) {
  const { slug } = await params;
  const clinic = await getClinicBySlug(slug);
  if (!clinic) notFound();

  const items = await prisma.portfolioItem.findMany({
    where: { clinicId: clinic.id, active: true },
    orderBy: { order: "asc" },
  });

  return (
    <Section>
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Resultados reais"
          title="Portfólio de Casos"
          subtitle={`Transformações reais de pacientes da ${clinic.name}.`}
        />

        {items.length === 0 ? (
          <p className="py-24 text-center text-ink-muted">Nenhum caso publicado ainda.</p>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-all duration-200 hover:shadow-card"
              >
                {(item.imageBefore || item.imageAfter) && (
                  <div className="grid grid-cols-2 gap-px bg-line">
                    <BeforeAfter src={item.imageBefore} label="Antes" />
                    <BeforeAfter src={item.imageAfter} label="Depois" />
                  </div>
                )}
                <div className="p-6">
                  {item.category && (
                    <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand-ink">
                      {item.category}
                    </span>
                  )}
                  <h3 className="mt-3 font-display text-lg font-bold text-ink">{item.title}</h3>
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

function BeforeAfter({ src, label }: { src: string | null; label: string }) {
  return (
    <div className="relative aspect-square bg-subtle">
      {src ? (
        <img src={src} alt={label} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink-muted">
          <ImageOff className="h-6 w-6" />
          <span className="text-xs">{label}</span>
        </span>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}
