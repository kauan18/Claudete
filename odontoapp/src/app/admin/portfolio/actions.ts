"use server";

import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPortfolioItem(formData: FormData) {
  const { clinicId } = await requireClinicSession();

  await prisma.portfolioItem.create({
    data: {
      clinicId,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      imageBefore: (formData.get("imageBefore") as string) || undefined,
      imageAfter: (formData.get("imageAfter") as string) || undefined,
      category: (formData.get("category") as string) || undefined,
      order: Number(formData.get("order") || 0),
      active: formData.getAll("active").includes("true"),
    },
  });

  revalidatePath("/admin/portfolio");
  redirect("/admin/portfolio");
}

export async function updatePortfolioItem(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;

  const item = await prisma.portfolioItem.findFirst({ where: { id, clinicId } });
  if (!item) throw new Error("Item não encontrado.");

  await prisma.portfolioItem.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      imageBefore: (formData.get("imageBefore") as string) || undefined,
      imageAfter: (formData.get("imageAfter") as string) || undefined,
      category: (formData.get("category") as string) || undefined,
      order: Number(formData.get("order") || 0),
      active: formData.getAll("active").includes("true"),
    },
  });

  revalidatePath("/admin/portfolio");
  redirect("/admin/portfolio");
}

export async function deletePortfolioItem(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;

  const item = await prisma.portfolioItem.findFirst({ where: { id, clinicId } });
  if (!item) throw new Error("Item não encontrado.");

  await prisma.portfolioItem.delete({ where: { id } });
  revalidatePath("/admin/portfolio");
}

export async function togglePortfolioItem(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;
  const active = formData.get("active") === "true";

  const item = await prisma.portfolioItem.findFirst({ where: { id, clinicId } });
  if (!item) throw new Error("Item não encontrado.");

  await prisma.portfolioItem.update({ where: { id }, data: { active } });
  revalidatePath("/admin/portfolio");
}
