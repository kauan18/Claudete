"use server";

import { requireSuperAdmin } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";

const ROLES = ["super_admin", "admin_clinica", "recepcao", "dentista"] as const;

const createSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  role: z.enum(ROLES),
  clinicId: z.string().optional(),
});

/** Resolve o clinicId conforme o papel: super_admin não tem clínica; demais exigem uma válida. */
async function resolveClinicId(role: string, clinicId: string | undefined): Promise<string | null> {
  if (role === "super_admin") return null;
  if (!clinicId) throw new Error("Selecione a clínica para este papel.");
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { id: true } });
  if (!clinic) throw new Error("Clínica inválida.");
  return clinic.id;
}

export async function createUser(formData: FormData) {
  await requireSuperAdmin();

  const data = createSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    clinicId: (formData.get("clinicId") as string) || undefined,
  });

  const taken = await prisma.user.findUnique({ where: { email: data.email } });
  if (taken) throw new Error(`Já existe um usuário com o e-mail ${data.email}.`);

  const clinicId = await resolveClinicId(data.role, data.clinicId);
  const password = await bcrypt.hash(data.password, 12);

  await prisma.user.create({
    data: { name: data.name, email: data.email, password, role: data.role, clinicId },
  });

  revalidatePath("/super-admin/usuarios");
  redirect("/super-admin/usuarios");
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  role: z.enum(ROLES),
  clinicId: z.string().optional(),
  newPassword: z.string().optional(),
});

export async function updateUser(formData: FormData) {
  const { user: me } = await requireSuperAdmin();

  const data = updateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    role: formData.get("role"),
    clinicId: (formData.get("clinicId") as string) || undefined,
    newPassword: (formData.get("newPassword") as string) || undefined,
  });

  const active = formData.getAll("active").includes("true");

  const target = await prisma.user.findUnique({ where: { id: data.id } });
  if (!target) throw new Error("Usuário não encontrado.");

  // Evita o super-admin se trancar para fora (rebaixar/desativar a si mesmo).
  if (data.id === me.id && (data.role !== "super_admin" || !active)) {
    throw new Error("Você não pode rebaixar nem desativar o seu próprio usuário.");
  }

  const clinicId = await resolveClinicId(data.role, data.clinicId);

  const update: {
    name: string;
    role: (typeof ROLES)[number];
    clinicId: string | null;
    active: boolean;
    password?: string;
  } = { name: data.name, role: data.role, clinicId, active };

  if (data.newPassword) {
    if (data.newPassword.length < 6) throw new Error("A nova senha deve ter ao menos 6 caracteres.");
    update.password = await bcrypt.hash(data.newPassword, 12);
  }

  await prisma.user.update({ where: { id: data.id }, data: update });

  revalidatePath("/super-admin/usuarios");
  redirect("/super-admin/usuarios");
}

export async function toggleUser(formData: FormData) {
  const { user: me } = await requireSuperAdmin();
  const id = formData.get("id") as string;
  const active = formData.get("active") === "true";

  if (id === me.id && !active) throw new Error("Você não pode desativar o seu próprio usuário.");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("Usuário não encontrado.");

  await prisma.user.update({ where: { id }, data: { active } });
  revalidatePath("/super-admin/usuarios");
}

export async function deleteUser(formData: FormData) {
  const { user: me } = await requireSuperAdmin();
  const id = formData.get("id") as string;

  if (id === me.id) throw new Error("Você não pode remover o seu próprio usuário.");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("Usuário não encontrado.");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/super-admin/usuarios");
}
