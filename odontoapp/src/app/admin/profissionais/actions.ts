"use server";

import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getPlan } from "@/lib/plans";

const schema = z.object({
  name: z.string().min(2),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  // Aceita URL externa ou caminho de upload (/uploads/...)
  photo: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

/**
 * Garante que ativar mais um profissional não excede o limite do plano.
 * Conta os profissionais ATIVOS da clínica (opcionalmente excluindo um id,
 * para o caso de edição reativando alguém). Usado por create e update — sem
 * isso, dava para burlar o limite reativando um profissional inativo.
 */
async function assertProfessionalQuota(clinicId: string, excludeId?: string) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { plan: true } });
  const plan = getPlan(clinic?.plan);
  if (plan.maxProfessionals === null) return;
  const count = await prisma.professional.count({
    where: { clinicId, active: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (count >= plan.maxProfessionals) {
    throw new Error(
      `Seu plano ${plan.name} permite até ${plan.maxProfessionals} profissional(is) ativo(s). Faça upgrade para adicionar mais.`,
    );
  }
}

export async function createProfessional(formData: FormData) {
  const { clinicId } = await requireClinicSession();

  // Limite de profissionais pelo plano da clínica
  await assertProfessionalQuota(clinicId);

  const parsed = schema.parse({
    name: formData.get("name"),
    specialty: formData.get("specialty") || undefined,
    bio: formData.get("bio") || undefined,
    photo: formData.get("photo") || undefined,
    active: true,
  });

  await prisma.professional.create({ data: { ...parsed, clinicId } });
  revalidatePath("/admin/profissionais");
  redirect("/admin/profissionais");
}

export async function updateProfessional(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;

  const pro = await prisma.professional.findFirst({ where: { id, clinicId } });
  if (!pro) throw new Error("Profissional não encontrado.");

  const parsed = schema.parse({
    name: formData.get("name"),
    specialty: formData.get("specialty") || undefined,
    bio: formData.get("bio") || undefined,
    photo: formData.get("photo") || undefined,
    active: formData.get("active") === "true",
  });

  // Reativando (inativo -> ativo)? Revalida a cota do plano.
  if (!pro.active && parsed.active) {
    await assertProfessionalQuota(clinicId, id);
  }

  await prisma.professional.update({ where: { id }, data: parsed });
  revalidatePath("/admin/profissionais");
  redirect("/admin/profissionais");
}

export async function deleteProfessional(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;

  const pro = await prisma.professional.findFirst({ where: { id, clinicId } });
  if (!pro) throw new Error("Profissional não encontrado.");

  await prisma.professional.delete({ where: { id } });
  revalidatePath("/admin/profissionais");
}
