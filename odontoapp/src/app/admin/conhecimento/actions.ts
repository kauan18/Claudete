"use server";

import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  question: z.string().min(3, "Pergunta obrigatória"),
  answer: z.string().min(3, "Resposta obrigatória"),
  category: z.string().optional(),
});

export async function createKnowledge(formData: FormData) {
  const { clinicId } = await requireClinicSession();

  const data = schema.parse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: (formData.get("category") as string) || undefined,
  });

  await prisma.knowledgeBase.create({
    data: {
      clinicId,
      question: data.question,
      answer: data.answer,
      category: data.category || null,
      active: formData.getAll("active").includes("true"),
    },
  });

  revalidatePath("/admin/conhecimento");
  redirect("/admin/conhecimento");
}

export async function updateKnowledge(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;

  const item = await prisma.knowledgeBase.findFirst({ where: { id, clinicId } });
  if (!item) throw new Error("Item não encontrado.");

  const data = schema.parse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: (formData.get("category") as string) || undefined,
  });

  await prisma.knowledgeBase.update({
    where: { id },
    data: {
      question: data.question,
      answer: data.answer,
      category: data.category || null,
      active: formData.getAll("active").includes("true"),
    },
  });

  revalidatePath("/admin/conhecimento");
  redirect("/admin/conhecimento");
}

export async function deleteKnowledge(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;

  const item = await prisma.knowledgeBase.findFirst({ where: { id, clinicId } });
  if (!item) throw new Error("Item não encontrado.");

  await prisma.knowledgeBase.delete({ where: { id } });
  revalidatePath("/admin/conhecimento");
}

export async function toggleKnowledge(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;
  const active = formData.get("active") === "true";

  const item = await prisma.knowledgeBase.findFirst({ where: { id, clinicId } });
  if (!item) throw new Error("Item não encontrado.");

  await prisma.knowledgeBase.update({ where: { id }, data: { active } });
  revalidatePath("/admin/conhecimento");
}
