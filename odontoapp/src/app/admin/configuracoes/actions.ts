"use server";

import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
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

  await prisma.clinic.update({ where: { id: clinicId }, data: parsed });
  revalidatePath("/admin/configuracoes");
  revalidatePath(`/c/${parsed.slug}`);
}
