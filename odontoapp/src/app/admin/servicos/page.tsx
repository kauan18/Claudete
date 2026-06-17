import { requireClinicSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteService, toggleService } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ToothMark } from "@/components/ui/ToothMark";
import { Button } from "@/components/ui/Button";

export default async function ServicosPage() {
  const { clinicId } = await requireClinicSession();

  const services = await prisma.service.findMany({
    where: { clinicId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Serviços</h1>
          <p className="mt-1 text-ink-muted">{services.length} serviço(s) cadastrado(s)</p>
        </div>
        <Button href="/admin/servicos/novo" size="sm">
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
        {services.length === 0 ? (
          <div className="py-16 text-center text-ink-muted">
            <ToothMark className="mx-auto mb-3 h-10 w-10 text-ink-muted" />
            <p>Nenhum serviço cadastrado.</p>
            <Link href="/admin/servicos/novo" className="mt-3 inline-block text-sm font-medium text-primary hover:text-brand-ink">
              Cadastrar primeiro serviço →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-subtle text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-6 py-3 text-left">Serviço</th>
                  <th className="px-6 py-3 text-left">Categoria</th>
                  <th className="px-6 py-3 text-left">Duração</th>
                  <th className="px-6 py-3 text-left">Preço</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {services.map((svc) => (
                  <tr key={svc.id} className="transition-colors hover:bg-subtle">
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink">{svc.name}</p>
                      {svc.description && <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{svc.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-ink-muted">{svc.category ?? "—"}</td>
                    <td className="px-6 py-4 text-ink-muted">{svc.durationMin} min</td>
                    <td className="px-6 py-4 text-ink-muted">
                      {svc.price ? `R$ ${Number(svc.price).toFixed(2).replace(".", ",")}` : "Consultar"}
                    </td>
                    <td className="px-6 py-4">
                      <form action={toggleService}>
                        <input type="hidden" name="id" value={svc.id} />
                        <input type="hidden" name="active" value={String(!svc.active)} />
                        <button
                          type="submit"
                          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                            svc.active
                              ? "bg-success/15 text-success hover:bg-success/25"
                              : "bg-subtle text-ink-muted hover:bg-line"
                          }`}
                        >
                          {svc.active ? "Ativo" : "Inativo"}
                        </button>
                      </form>
                    </td>
                    <td className="space-x-3 px-6 py-4 text-right">
                      <Link href={`/admin/servicos/${svc.id}`} className="font-medium text-primary hover:text-brand-ink">
                        Editar
                      </Link>
                      <form action={deleteService} className="inline">
                        <input type="hidden" name="id" value={svc.id} />
                        <ConfirmSubmitButton confirmMessage="Remover este serviço?" className="font-medium text-danger hover:underline">
                          Remover
                        </ConfirmSubmitButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
