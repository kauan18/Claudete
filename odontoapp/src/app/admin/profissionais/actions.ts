"use server";

import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  photo: z.string().url().optional().or(z.literal("")),
  active: z.coerce.boolean().optional(),
});

export async function createProfessional(formData: FormData) {
  const { clinicId } = await requireClinicSession();

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
