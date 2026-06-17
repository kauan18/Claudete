"use server";

import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  durationMin: z.coerce.number().int().min(15),
  price: z.coerce.number().optional(),
  category: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

export async function createService(formData: FormData) {
  const { clinicId } = await requireClinicSession();

  const parsed = serviceSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    durationMin: formData.get("durationMin"),
    price: formData.get("price") || undefined,
    category: formData.get("category") || undefined,
    active: formData.get("active") ?? true,
  });

  await prisma.service.create({ data: { ...parsed, clinicId } });
  revalidatePath("/admin/servicos");
  redirect("/admin/servicos");
}

export async function updateService(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;

  const svc = await prisma.service.findFirst({ where: { id, clinicId } });
  if (!svc) throw new Error("Serviço não encontrado.");

  const parsed = serviceSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    durationMin: formData.get("durationMin"),
    price: formData.get("price") || undefined,
    category: formData.get("category") || undefined,
    active: formData.get("active") === "true",
  });

  await prisma.service.update({ where: { id }, data: parsed });
  revalidatePath("/admin/servicos");
  redirect("/admin/servicos");
}

export async function deleteService(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;

  const svc = await prisma.service.findFirst({ where: { id, clinicId } });
  if (!svc) throw new Error("Serviço não encontrado.");

  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/servicos");
}

export async function toggleService(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;
  const active = formData.get("active") === "true";

  const svc = await prisma.service.findFirst({ where: { id, clinicId } });
  if (!svc) throw new Error("Serviço não encontrado.");

  await prisma.service.update({ where: { id }, data: { active } });
  revalidatePath("/admin/servicos");
}
