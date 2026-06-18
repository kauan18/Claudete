"use server";

import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify } from "@/lib/slug";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  logo: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().optional(),
  appointmentBuffer: z.coerce.number().int().min(0),
  cancelMinHours: z.coerce.number().int().min(0),
  waToken: z.string().optional(),
  waPhoneNumberId: z.string().optional(),
  waBusinessAccount: z.string().optional(),
});

export async function updateClinicSettings(formData: FormData) {
  const { clinicId } = await requireClinicSession();

  const parsed = schema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    logo: (formData.get("logo") as string) ?? undefined,
    description: formData.get("description") || undefined,
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    instagram: formData.get("instagram") || undefined,
    facebook: formData.get("facebook") || undefined,
    website: formData.get("website") || undefined,
    appointmentBuffer: formData.get("appointmentBuffer"),
    cancelMinHours: formData.get("cancelMinHours"),
    waToken: formData.get("waToken") || undefined,
    waPhoneNumberId: formData.get("waPhoneNumberId") || undefined,
    waBusinessAccount: formData.get("waBusinessAccount") || undefined,
  });

  // Normaliza o slug e garante que não colide com outra clínica (mesma guarda
  // do super-admin), evitando erro Prisma P2002 cru e slugs degenerados.
  const slug = slugify(parsed.slug);
  if (!slug) throw new Error("Slug inválido.");
  const taken = await prisma.clinic.findUnique({ where: { slug } });
  if (taken && taken.id !== clinicId) {
    throw new Error(`O slug "${slug}" já está em uso por outra clínica.`);
  }

  await prisma.clinic.update({ where: { id: clinicId }, data: { ...parsed, slug } });
  revalidatePath("/admin/configuracoes");
  revalidatePath(`/c/${slug}`);
}
