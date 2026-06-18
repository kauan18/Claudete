"use server";

import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getPlan, isPlanId } from "@/lib/plans";
import { createPreapproval } from "@/lib/mercadopago";
import { absoluteUrl } from "@/lib/site";

export async function startSubscription(formData: FormData) {
  const { clinicId, user } = await requireClinicSession();

  const planId = formData.get("planId") as string;
  if (!isPlanId(planId)) throw new Error("Plano inválido.");
  const plan = getPlan(planId);

  const email = user.email;
  if (!email) throw new Error("Seu usuário não tem e-mail cadastrado para a assinatura.");

  const result = await createPreapproval({
    clinicId,
    plan,
    payerEmail: email,
    backUrl: absoluteUrl("/admin/assinatura?retorno=1"),
  });

  if (!result.ok) throw new Error(result.error);

  await prisma.clinic.update({
    where: { id: clinicId },
    data: {
      mpPreapprovalId: result.id,
      subscriptionStatus: "pending",
      subscriptionUpdatedAt: new Date(),
    },
  });

  // Redireciona para o checkout do Mercado Pago (URL externa).
  redirect(result.initPoint);
}
