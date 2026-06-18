import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireSuperAdmin } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { updateUser } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass, checkboxClass } from "@/components/ui/form";

const ROLE_OPTIONS = [
  { value: "admin_clinica", label: "Admin da Clínica" },
  { value: "recepcao", label: "Recepção" },
  { value: "dentista", label: "Dentista" },
  { value: "super_admin", label: "Super Admin (sem clínica)" },
];

type Props = { params: Promise<{ id: string }> };

export default async function EditarUsuario({ params }: Props) {
  await requireSuperAdmin();
  const { id } = await params;

  const [user, clinics] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.clinic.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!user) notFound();

  return (
    <div className="min-h-screen bg-page p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/super-admin/usuarios" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Editar Usuário</h1>
          <p className="mt-1 text-ink-muted">{user.email}</p>
        </div>

        <form action={updateUser} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
          <input type="hidden" name="id" value={user.id} />

          <div>
            <label className={labelClass}>Nome *</label>
            <input name="name" required defaultValue={user.name} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>E-mail</label>
            <input value={user.email} disabled className={`${inputClass} opacity-60`} />
            <p className="mt-1 text-xs text-ink-muted">O e-mail de acesso não pode ser alterado.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Papel *</label>
              <select name="role" defaultValue={user.role} required className={inputClass}>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Clínica</label>
              <select name="clinicId" defaultValue={user.clinicId ?? ""} className={inputClass}>
                <option value="">— (obrigatória, exceto Super Admin)</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Nova senha (opcional)</label>
            <input name="newPassword" type="text" minLength={6} className={inputClass} placeholder="deixe vazio para manter a atual" />
          </div>

          <div className="flex items-center gap-3">
            <input type="hidden" name="active" value="false" />
            <input type="checkbox" name="active" value="true" id="active" defaultChecked={user.active} className={checkboxClass} />
            <label htmlFor="active" className="text-sm text-ink">Usuário ativo</label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">Salvar Alterações</Button>
            <Button href="/super-admin/usuarios" variant="outline">Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
