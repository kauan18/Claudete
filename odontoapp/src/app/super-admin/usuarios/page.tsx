import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireSuperAdmin } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin_clinica: "Admin da Clínica",
  recepcao: "Recepção",
  dentista: "Dentista",
};

export default async function UsuariosPage() {
  await requireSuperAdmin();

  const users = await prisma.user.findMany({
    orderBy: [{ clinicId: "asc" }, { name: "asc" }],
    include: { clinic: { select: { name: true } } },
  });

  return (
    <div className="min-h-screen bg-page p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/super-admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Usuários</h1>
          <p className="mt-1 text-ink-muted">{users.length} usuário(s) no sistema</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-subtle text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-6 py-3 text-left">Nome</th>
                  <th className="px-6 py-3 text-left">E-mail</th>
                  <th className="px-6 py-3 text-left">Papel</th>
                  <th className="px-6 py-3 text-left">Clínica</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-subtle">
                    <td className="px-6 py-4 font-medium text-ink">{u.name}</td>
                    <td className="px-6 py-4 text-ink-muted">{u.email}</td>
                    <td className="px-6 py-4 text-ink-muted">{ROLE_LABELS[u.role] ?? u.role}</td>
                    <td className="px-6 py-4 text-ink-muted">{u.clinic?.name ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          u.active ? "bg-success/15 text-success" : "bg-subtle text-ink-muted"
                        }`}
                      >
                        {u.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
