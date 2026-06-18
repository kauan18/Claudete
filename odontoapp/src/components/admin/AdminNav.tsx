"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Stethoscope,
  Images,
  BookOpen,
  CreditCard,
  Settings,
  Building2,
  Users,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ToothMark } from "@/components/ui/ToothMark";
import { cn } from "@/lib/cn";

interface User {
  name?: string | null;
  email?: string | null;
  role: string;
  clinicName?: string | null;
}

type Item = { href: string; label: string; Icon: React.ComponentType<{ className?: string }>; exact?: boolean };

const navItems: Item[] = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/agenda", label: "Agenda", Icon: CalendarDays },
  { href: "/admin/agendamentos", label: "Agendamentos", Icon: ClipboardList },
  { href: "/admin/servicos", label: "Serviços", Icon: ToothMark },
  { href: "/admin/profissionais", label: "Profissionais", Icon: Stethoscope },
  { href: "/admin/portfolio", label: "Portfólio", Icon: Images },
  { href: "/admin/conhecimento", label: "Base de Conhecimento", Icon: BookOpen },
  { href: "/admin/assinatura", label: "Assinatura", Icon: CreditCard },
  { href: "/admin/configuracoes", label: "Configurações", Icon: Settings },
];

const superAdminItems: Item[] = [
  { href: "/super-admin", label: "Clínicas", Icon: Building2 },
  { href: "/super-admin/usuarios", label: "Usuários", Icon: Users },
];

export function AdminNav({ user }: { user: User }) {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const items = user.role === "super_admin" ? superAdminItems : navItems;

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      active ? "bg-brand-tint text-brand-ink" : "text-ink-muted hover:bg-subtle hover:text-ink",
    );

  return (
    <aside className="fixed left-0 top-0 z-10 flex h-full w-64 flex-col border-r border-line bg-surface">
      {/* Logo / clínica */}
      <div className="border-b border-line p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
              <ToothMark className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display font-bold leading-tight text-ink">
                {user.clinicName ?? "OdontoApp"}
              </p>
              <p className="text-xs capitalize text-ink-muted">{user.role?.replace("_", " ")}</p>
            </div>
          </div>
          <ThemeToggle className="shrink-0" />
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map(({ href, label, Icon, exact }) => (
          <Link key={href} href={href} className={linkClass(isActive(href, exact))}>
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </Link>
        ))}

        {/* Super admin pode também ver o painel admin de uma clínica */}
        {user.role === "super_admin" && (
          <>
            <div className="px-3 pb-1 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Painel</p>
            </div>
            {navItems.map(({ href, label, Icon, exact }) => (
              <Link key={href} href={href} className={linkClass(isActive(href, exact))}>
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Usuário + logout */}
      <div className="border-t border-line p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tint text-sm font-bold text-brand-ink">
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
