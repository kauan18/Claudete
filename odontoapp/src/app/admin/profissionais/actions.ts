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

export async function createProfessional(formData: FormData) {
  const { clinicId } = await requireClinicSession();

  // Limite de profissionais pelo plano da clínica
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { plan: true } });
  const plan = getPlan(clinic?.plan);
  if (plan.maxProfessionals !== null) {
    const count = await prisma.professional.count({ where: { clinicId, active: true } });
    if (count >= plan.maxProfessionals) {
      throw new Error(
        `Seu plano ${plan.name} permite até ${plan.maxProfessionals} profissional(is) ativo(s). Faça upgrade para adicionar mais.`,
      );
    }
  }

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
