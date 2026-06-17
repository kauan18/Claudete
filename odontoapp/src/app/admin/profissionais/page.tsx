import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { deleteProfessional } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { Button } from "@/components/ui/Button";

export default async function ProfissionaisPage() {
  const { clinicId } = await requireClinicSession();

  const pros = await prisma.professional.findMany({
    where: { clinicId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Profissionais</h1>
          <p className="mt-1 text-ink-muted">{pros.length} profissional(is)</p>
        </div>
        <Button href="/admin/profissionais/novo" size="sm">
          + Novo Profissional
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pros.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-line bg-surface py-16 text-center text-ink-muted shadow-soft">
            <Stethoscope className="mx-auto mb-3 h-10 w-10 text-ink-muted" />
            <p>Nenhum profissional cadastrado.</p>
          </div>
        ) : (
          pros.map((pro) => (
            <div
              key={pro.id}
              className="space-y-3 rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-brand-tint">
                  {pro.photo ? (
                    <img src={pro.photo} alt={pro.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-bold text-brand-ink">
                      {pro.name[0]}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{pro.name}</p>
                  {pro.specialty && <p className="truncate text-xs text-primary">{pro.specialty}</p>}
                </div>
              </div>
              {pro.bio && <p className="line-clamp-2 text-sm text-ink-muted">{pro.bio}</p>}
              <div className="flex gap-4 border-t border-line pt-3">
                <Link href={`/admin/profissionais/${pro.id}`} className="text-sm font-medium text-primary hover:text-brand-ink">
                  Editar
                </Link>
                <form action={deleteProfessional}>
                  <input type="hidden" name="id" value={pro.id} />
                  <ConfirmSubmitButton confirmMessage="Remover este profissional?" className="text-sm font-medium text-danger hover:underline">
                    Remover
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
