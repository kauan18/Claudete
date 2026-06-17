import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, CalendarDays, ExternalLink, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

export default async function SuperAdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") redirect("/admin");

  const clinics = await prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true, appointments: true } } },
  });

  return (
    <div className="min-h-screen bg-page p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Super Admin</h1>
            <p className="mt-1 text-ink-muted">{clinics.length} clínica(s) registrada(s)</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button href="/super-admin/usuarios" size="sm" variant="outline">
              <Users className="h-4 w-4" />
              Usuários
            </Button>
            <Button href="/super-admin/clinicas/nova" size="sm">
              <Plus className="h-4 w-4" />
              Nova Clínica
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div>
                <h2 className="font-display text-lg font-bold text-ink">{clinic.name}</h2>
                <p className="font-mono text-sm text-primary">/{clinic.slug}</p>
              </div>
              <div className="flex gap-6 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {clinic._count.users} usuários
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {clinic._count.appointments} agend.
                </span>
              </div>
              <div className="flex gap-4 border-t border-line pt-3">
                <Link
                  href={`/c/${clinic.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-brand-ink"
                  target="_blank"
                >
                  Ver página pública
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Link href={`/super-admin/clinicas/${clinic.id}`} className="text-xs font-medium text-ink-muted hover:text-ink">
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
