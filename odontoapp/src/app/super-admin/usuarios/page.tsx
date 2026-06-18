import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { requireSuperAdmin } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { toggleUser, deleteUser } from "./actions";

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

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Usuários</h1>
            <p className="mt-1 text-ink-muted">{users.length} usuário(s) no sistema</p>
          </div>
          <Button href="/super-admin/usuarios/novo" size="sm">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
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
                  <th className="px-6 py-3 text-right">Ações</th>
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
                      <form action={toggleUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="active" value={String(!u.active)} />
                        <button
                          type="submit"
                          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                            u.active ? "bg-success/15 text-success hover:bg-success/25" : "bg-subtle text-ink-muted hover:bg-line"
                          }`}
                        >
                          {u.active ? "Ativo" : "Inativo"}
                        </button>
                      </form>
                    </td>
                    <td className="space-x-3 whitespace-nowrap px-6 py-4 text-right">
                      <Link href={`/super-admin/usuarios/${u.id}`} className="font-medium text-primary hover:text-brand-ink">
                        Editar
                      </Link>
                      <form action={deleteUser} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <ConfirmSubmitButton confirmMessage="Remover este usuário? Esta ação não pode ser desfeita." className="font-medium text-danger hover:underline">
                          Remover
                        </ConfirmSubmitButton>
                      </form>
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
