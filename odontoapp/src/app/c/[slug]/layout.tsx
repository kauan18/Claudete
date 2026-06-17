import { getClinicBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ClinicHeader } from "@/components/public/ClinicHeader";
import { ClinicFooter } from "@/components/public/ClinicFooter";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { ChatWidget } from "@/components/public/ChatWidget";
import { brandVars } from "@/lib/brand";

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { slug } = await params;
  const clinic = await getClinicBySlug(slug);
  if (!clinic) return { title: "Clínica não encontrada" };
  return {
    title: `${clinic.name} | OdontoApp`,
    description: clinic.description ?? undefined,
  };
}

export default async function ClinicPublicLayout({ params, children }: Props) {
  const { slug } = await params;
  const clinic = await getClinicBySlug(slug);
  if (!clinic) notFound();

  return (
    <div className="clinic-scope flex min-h-screen flex-col bg-page" style={brandVars(clinic.primaryColor, clinic.secondaryColor)}>
      <ClinicHeader clinic={clinic} />
      <main className="flex-1">{children}</main>
      <ClinicFooter clinic={clinic} />
      {clinic.whatsapp && <WhatsAppButton whatsapp={clinic.whatsapp} clinicName={clinic.name} />}
      <ChatWidget clinicId={clinic.id} slug={clinic.slug} clinicName={clinic.name} />
    </div>
  );
}
