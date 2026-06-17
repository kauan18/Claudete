"use server";

import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendAppointmentConfirmation } from "@/lib/whatsapp";

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

  // Envia WhatsApp de confirmação ao paciente
  if (status === "confirmado") {
    sendAppointmentConfirmation({
      patientPhone: appt.patientPhone,
      patientName: appt.patientName,
      clinicName: appt.clinic.name,
      serviceName: appt.service.name,
      professionalName: appt.professional.name,
      scheduledAt: appt.scheduledAt,
      credentials:
        appt.clinic.waToken && appt.clinic.waPhoneNumberId
          ? { token: appt.clinic.waToken, phoneNumberId: appt.clinic.waPhoneNumberId }
          : null,
    }).catch(console.error);
  }

  revalidatePath("/admin/agendamentos");
  revalidatePath("/admin");
}
