import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireSuperAdmin } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { createUser } from "../actions";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";

const ROLE_OPTIONS = [
  { value: "admin_clinica", label: "Admin da Clínica" },
  { value: "recepcao", label: "Recepção" },
  { value: "dentista", label: "Dentista" },
  { value: "super_admin", label: "Super Admin (sem clínica)" },
];

export default async function NovoUsuario() {
  await requireSuperAdmin();
  const clinics = await prisma.clinic.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="min-h-screen bg-page p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/super-admin/usuarios" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Novo Usuário</h1>
          <p className="mt-1 text-ink-muted">Crie um acesso para uma clínica (ou outro super-admin)</p>
        </div>

        <form action={createUser} className="space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-soft">
          <div>
            <label className={labelClass}>Nome *</label>
            <input name="name" required className={inputClass} placeholder="Ex: Carla Recepção" />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>E-mail de acesso *</label>
              <input name="email" type="email" required className={inputClass} placeholder="usuario@clinica.com.br" />
            </div>
            <div>
              <label className={labelClass}>Senha inicial *</label>
              <input name="password" type="text" required minLength={6} className={inputClass} placeholder="mínimo 6 caracteres" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Papel *</label>
              <select name="role" defaultValue="admin_clinica" required className={inputClass}>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Clínica</label>
              <select name="clinicId" defaultValue="" className={inputClass}>
                <option value="">— (obrigatória, exceto Super Admin)</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">Criar Usuário</Button>
            <Button href="/super-admin/usuarios" variant="outline">Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
