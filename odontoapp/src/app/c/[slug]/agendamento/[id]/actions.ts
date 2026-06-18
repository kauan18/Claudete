"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyCancelToken } from "@/lib/appointmentToken";

export async function cancelByToken(formData: FormData) {
  const id = formData.get("id") as string;
  const t = formData.get("t") as string;
  const slug = formData.get("slug") as string;

  // Reverifica o token no servidor — nunca confia só na UI.
  if (!verifyCancelToken(id, t)) throw new Error("Link inválido.");

  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { clinic: { select: { slug: true, cancelMinHours: true } } },
  });
  if (!appt || appt.clinic.slug !== slug) throw new Error("Agendamento não encontrado.");

  if (appt.status === "cancelado") {
    redirect(`/c/${slug}/agendamento/${id}?t=${t}&cancelado=1`);
  }
  if (appt.status !== "solicitado" && appt.status !== "confirmado") {
    throw new Error("Este agendamento não pode ser cancelado.");
  }

  const cutoff = appt.scheduledAt.getTime() - appt.clinic.cancelMinHours * 3600 * 1000;
  if (Date.now() > cutoff) {
    throw new Error("O prazo para cancelamento online já passou. Entre em contato com a clínica.");
  }

  await prisma.appointment.update({ where: { id }, data: { status: "cancelado" } });
  revalidatePath(`/c/${slug}/agendamento/${id}`);
  revalidatePath("/admin/agendamentos");
  revalidatePath("/admin/agenda");
  redirect(`/c/${slug}/agendamento/${id}?t=${t}&cancelado=1`);
}
