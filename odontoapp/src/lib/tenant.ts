import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Retorna o clinicId do usuário logado.
 * Redireciona para /login se não autenticado.
 * Lança erro se o usuário não tiver clínica (ex: super_admin acessando rota errada).
 */
export async function requireClinicSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!session.user.clinicId) {
    // Super-admin não tem clínica própria: manda para o painel dele
    // (evita exceção ao navegar em páginas de clínica).
    if (session.user.role === "super_admin") redirect("/super-admin");
    throw new Error("Usuário não pertence a nenhuma clínica.");
  }

  return {
    user: session.user,
    clinicId: session.user.clinicId,
  };
}

/**
 * Garante que o usuário logado é super_admin.
 * Redireciona para /login se anônimo, ou /admin se for de clínica.
 */
export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "super_admin") redirect("/admin");
  return { user: session.user };
}

/**
 * Garante que o recurso pertence à clínica do usuário logado.
 * Uso: await assertTenant(appointment.clinicId)
 */
export async function assertTenant(resourceClinicId: string) {
  const { clinicId } = await requireClinicSession();
  if (resourceClinicId !== clinicId) {
    throw new Error("Acesso negado: recurso pertence a outro tenant.");
  }
}

/**
 * Busca a clínica pelo slug (para páginas públicas).
 * Retorna null se não encontrada.
 */
export async function getClinicBySlug(slug: string) {
  return prisma.clinic.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      logo: true,
      description: true,
      address: true,
      phone: true,
      whatsapp: true,
      email: true,
      businessHours: true,
      instagram: true,
      facebook: true,
      website: true,
      primaryColor: true,
      secondaryColor: true,
    },
  });
}
