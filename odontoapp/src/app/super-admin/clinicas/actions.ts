"use server";

import { requireSuperAdmin } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { slugify } from "@/lib/slug";

const HEX = /^#[0-9a-fA-F]{6}$/;

const createSchema = z.object({
  name: z.string().min(2, "Nome da clínica obrigatório"),
  slug: z.string().optional(),
  plan: z.enum(["basico", "pro", "premium"]).optional(),
  primaryColor: z.string().regex(HEX).optional(),
  secondaryColor: z.string().regex(HEX).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  description: z.string().optional(),
  adminName: z.string().min(2, "Nome do responsável obrigatório"),
  adminEmail: z.string().email("E-mail do responsável inválido"),
  adminPassword: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export async function createClinic(formData: FormData) {
  await requireSuperAdmin();

  const data = createSchema.parse({
    name: formData.get("name"),
    slug: (formData.get("slug") as string) || undefined,
    plan: (formData.get("plan") as string) || undefined,
    primaryColor: (formData.get("primaryColor") as string) || undefined,
    secondaryColor: (formData.get("secondaryColor") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    whatsapp: (formData.get("whatsapp") as string) || undefined,
    email: (formData.get("email") as string) ?? "",
    address: (formData.get("address") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    adminName: formData.get("adminName"),
    adminEmail: formData.get("adminEmail"),
    adminPassword: formData.get("adminPassword"),
  });

  const slug = slugify(data.slug || data.name);
  if (!slug) throw new Error("Não foi possível gerar o slug a partir do nome.");

  const slugTaken = await prisma.clinic.findUnique({ where: { slug } });
  if (slugTaken) throw new Error(`O slug "${slug}" já está em uso. Escolha outro.`);

  const emailTaken = await prisma.user.findUnique({ where: { email: data.adminEmail } });
  if (emailTaken) throw new Error(`Já existe um usuário com o e-mail ${data.adminEmail}.`);

  const passwordHash = await bcrypt.hash(data.adminPassword, 12);

  await prisma.clinic.create({
    data: {
      slug,
      name: data.name,
      plan: data.plan ?? "basico",
      primaryColor: data.primaryColor || "#0ea5e9",
      secondaryColor: data.secondaryColor || "#0369a1",
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      address: data.address || null,
      description: data.description || null,
      users: {
        create: {
          name: data.adminName,
          email: data.adminEmail,
          password: passwordHash,
          role: "admin_clinica",
        },
      },
    },
  });

  revalidatePath("/super-admin");
  redirect("/super-admin");
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  slug: z.string().min(1),
  plan: z.enum(["basico", "pro", "premium"]).optional(),
  primaryColor: z.string().regex(HEX).optional(),
  secondaryColor: z.string().regex(HEX).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  description: z.string().optional(),
});

export async function updateClinic(formData: FormData) {
  await requireSuperAdmin();

  const data = updateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    plan: (formData.get("plan") as string) || undefined,
    primaryColor: (formData.get("primaryColor") as string) || undefined,
    secondaryColor: (formData.get("secondaryColor") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    whatsapp: (formData.get("whatsapp") as string) || undefined,
    email: (formData.get("email") as string) ?? "",
    address: (formData.get("address") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
  });

  const clinic = await prisma.clinic.findUnique({ where: { id: data.id } });
  if (!clinic) throw new Error("Clínica não encontrada.");

  const slug = slugify(data.slug);
  if (!slug) throw new Error("Slug inválido.");
  if (slug !== clinic.slug) {
    const taken = await prisma.clinic.findUnique({ where: { slug } });
    if (taken) throw new Error(`O slug "${slug}" já está em uso.`);
  }

  await prisma.clinic.update({
    where: { id: data.id },
    data: {
      name: data.name,
      slug,
      plan: data.plan ?? clinic.plan,
      primaryColor: data.primaryColor || clinic.primaryColor,
      secondaryColor: data.secondaryColor || clinic.secondaryColor,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      address: data.address || null,
      description: data.description || null,
    },
  });

  revalidatePath("/super-admin");
  redirect("/super-admin");
}
