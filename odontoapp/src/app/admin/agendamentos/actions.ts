"use server";

import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendAppointmentConfirmation } from "@/lib/whatsapp";
import { getPlan } from "@/lib/plans";
import { zonedWallToUtc } from "@/lib/availability";
import { cancelPath } from "@/lib/appointmentToken";
import { absoluteUrl } from "@/lib/site";

const manualSchema = z.object({
  patientName: z.string().min(2, "Nome obrigatório"),
  patientPhone: z.string().min(8, "Telefone obrigatório"),
  patientEmail: z.string().email().optional().or(z.literal("")),
  serviceId: z.string().min(1, "Selecione um serviço"),
  professionalId: z.string().min(1, "Selecione um profissional"),
  date: z.string().min(1, "Data obrigatória"),
  time: z.string().min(1, "Horário obrigatório"),
  status: z.enum(["solicitado", "confirmado", "concluido", "cancelado", "nao_compareceu"]).optional(),
  notes: z.string().optional(),
});

export async function createAppointmentManual(formData: FormData) {
  const { clinicId } = await requireClinicSession();

  const data = manualSchema.parse({
    patientName: formData.get("patientName"),
    patientPhone: formData.get("patientPhone"),
    patientEmail: formData.get("patientEmail") ?? "",
    serviceId: formData.get("serviceId"),
    professionalId: formData.get("professionalId"),
    date: formData.get("date"),
    time: formData.get("time"),
    status: (formData.get("status") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  });

  // Garante que serviço e profissional pertencem à clínica (isolamento tenant)
  const service = await prisma.service.findFirst({ where: { id: data.serviceId, clinicId } });
  if (!service) throw new Error("Serviço inválido.");
  const professional = await prisma.professional.findFirst({ where: { id: data.professionalId, clinicId } });
  if (!professional) throw new Error("Profissional inválido.");

  const scheduledAt = new Date(`${data.date}T${data.time}`);
  if (isNaN(scheduledAt.getTime())) throw new Error("Data/hora inválida.");
  const endsAt = new Date(scheduledAt.getTime() + service.durationMin * 60000);

  await prisma.appointment.create({
    data: {
      clinicId,
      serviceId: data.serviceId,
      professionalId: data.professionalId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail || null,
      scheduledAt,
      endsAt,
      status: data.status ?? "confirmado",
      notes: data.notes || null,
    },
  });

  revalidatePath("/admin/agendamentos");
  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  redirect("/admin/agendamentos");
}

const rescheduleSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1, "Data obrigatória"),
  time: z.string().min(1, "Horário obrigatório"),
});

export async function rescheduleAppointment(formData: FormData) {
  const { clinicId } = await requireClinicSession();

  const data = rescheduleSchema.parse({
    id: formData.get("id"),
    date: formData.get("date"),
    time: formData.get("time"),
  });

  const appt = await prisma.appointment.findFirst({
    where: { id: data.id, clinicId },
    include: { service: true },
  });
  if (!appt) throw new Error("Agendamento não encontrado.");

  // Converte o horário local (fuso da clínica) para UTC corretamente.
  const scheduledAt = zonedWallToUtc(data.date, data.time);
  if (isNaN(scheduledAt.getTime())) throw new Error("Data/hora inválida.");
  const endsAt = new Date(scheduledAt.getTime() + appt.service.durationMin * 60000);

  await prisma.appointment.update({
    where: { id: data.id },
    // Remarcou → os lembretes precisam ser reenviados para o novo horário.
    data: { scheduledAt, endsAt, reminderSent24h: false, reminderSent1h: false },
  });

  revalidatePath("/admin/agendamentos");
  revalidatePath("/admin/agenda");
  revalidatePath(`/admin/agendamentos/${data.id}`);
  redirect(`/admin/agendamentos/${data.id}`);
}

export async function updateAppointmentStatus(formData: FormData) {
  const { clinicId } = await requireClinicSession();
  const id = formData.get("id") as string;
  const status = formData.get("status") as "confirmado" | "cancelado" | "concluido" | "nao_compareceu";

  const appt = await prisma.appointment.findFirst({
    where: { id, clinicId },
    include: { service: true, professional: true, clinic: true },
  });
  if (!appt) throw new Error("Agendamento não encontrado.");

  await prisma.appointment.update({ where: { id }, data: { status } });

  // Envia WhatsApp de confirmação ao paciente (apenas planos com WhatsApp)
  if (status === "confirmado" && getPlan(appt.clinic.plan).whatsapp) {
    sendAppointmentConfirmation({
      patientPhone: appt.patientPhone,
      patientName: appt.patientName,
      clinicName: appt.clinic.name,
      serviceName: appt.service.name,
      professionalName: appt.professional.name,
      scheduledAt: appt.scheduledAt,
      cancelUrl: absoluteUrl(cancelPath(appt.clinic.slug, appt.id)),
      credentials:
        appt.clinic.waToken && appt.clinic.waPhoneNumberId
          ? { token: appt.clinic.waToken, phoneNumberId: appt.clinic.waPhoneNumberId }
          : null,
    }).catch(console.error);
  }

  revalidatePath("/admin/agendamentos");
  revalidatePath("/admin");
}
