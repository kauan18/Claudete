"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

interface Clinic {
  slug: string;
  name: string;
  logo?: string | null;
}

export function ClinicHeader({ clinic }: { clinic: Clinic }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const base = `/c/${clinic.slug}`;

  const navItems = [
    { href: base, label: "Início" },
    { href: `${base}/servicos`, label: "Serviços" },
    { href: `${base}/portfolio`, label: "Portfólio" },
    { href: `${base}/agendar`, label: "Agendar" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href={base} aria-label={clinic.name} onClick={() => setOpen(false)}>
          <Logo name={clinic.name} logo={clinic.logo} className="[&_span:last-child]:hidden sm:[&_span:last-child]:flex" />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand-tint text-brand-ink" : "text-ink-muted hover:bg-subtle hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button href={`${base}/agendar`} size="sm" className="hidden sm:inline-flex">
            Agendar
          </Button>
          {/* Botão mobile */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-subtle hover:text-ink md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Menu mobile */}
      {open && (
        <nav className="border-t border-line bg-surface md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    active ? "bg-brand-tint text-brand-ink" : "text-ink-muted hover:bg-subtle hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button href={`${base}/agendar`} size="md" className="mt-2" onClick={() => setOpen(false)}>
              Agendar consulta
            </Button>
          </Container>
        </nav>
      )}
    </header>
  );
}
