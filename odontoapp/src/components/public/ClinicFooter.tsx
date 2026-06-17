import Link from "next/link";
import { Globe, MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Section";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";

interface Clinic {
  slug: string;
  name: string;
  logo?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  website?: string | null;
}

export function ClinicFooter({ clinic }: { clinic: Clinic }) {
  const base = `/c/${clinic.slug}`;
  const year = new Date().getFullYear();

  const nav = [
    { href: base, label: "Início" },
    { href: `${base}/servicos`, label: "Serviços" },
    { href: `${base}/portfolio`, label: "Portfólio" },
    { href: `${base}/agendar`, label: "Agendar" },
  ];

  const socials = [
    clinic.instagram && { href: clinic.instagram, label: "Instagram", Icon: InstagramIcon },
    clinic.facebook && { href: clinic.facebook, label: "Facebook", Icon: FacebookIcon },
    clinic.website && { href: clinic.website, label: "Website", Icon: Globe },
  ].filter(Boolean) as { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[];

  return (
    <footer className="mt-auto border-t border-line bg-subtle">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="space-y-4 lg:col-span-2">
            <Logo name={clinic.name} logo={clinic.logo} />
            {clinic.description && (
              <p className="max-w-sm text-sm leading-relaxed text-ink-muted">{clinic.description}</p>
            )}
            {socials.length > 0 && (
              <div className="flex items-center gap-3 pt-1">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navegação */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Navegação</h3>
            <ul className="mt-4 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-ink-muted transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Contato</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              {clinic.address && (
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{clinic.address}</span>
                </li>
              )}
              {clinic.phone && (
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <a href={`tel:${clinic.phone}`} className="transition-colors hover:text-primary">
                    {clinic.phone}
                  </a>
                </li>
              )}
              {clinic.email && (
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <a href={`mailto:${clinic.email}`} className="break-all transition-colors hover:text-primary">
                    {clinic.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row">
          <p>© {year} {clinic.name}. Todos os direitos reservados.</p>
          <Link href="/privacidade" className="transition-colors hover:text-primary">
            Política de Privacidade
          </Link>
        </div>
      </Container>
    </footer>
  );
}
