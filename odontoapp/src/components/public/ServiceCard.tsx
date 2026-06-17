import { Clock, ArrowRight } from "lucide-react";
import { ToothMark } from "@/components/ui/ToothMark";
import { Button } from "@/components/ui/Button";

export type ServiceCardData = {
  id: string;
  name: string;
  description?: string | null;
  durationMin: number;
  price?: number | null;
  category?: string | null;
};

function formatPrice(price: number) {
  return `R$ ${price.toFixed(2).replace(".", ",")}`;
}

export function ServiceCard({ svc, slug }: { svc: ServiceCardData; slug: string }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card">
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
          <ToothMark className="h-6 w-6" />
        </span>
        {svc.category && (
          <span className="rounded-full bg-subtle px-3 py-1 text-xs font-medium text-ink-muted">
            {svc.category}
          </span>
        )}
      </div>

      <h3 className="mt-5 font-display text-lg font-bold text-ink">{svc.name}</h3>
      {svc.description && (
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted">{svc.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
          <Clock className="h-4 w-4" />
          {svc.durationMin} min
        </span>
        {svc.price != null && (
          <span className="font-display text-base font-bold text-ink">{formatPrice(svc.price)}</span>
        )}
      </div>

      <Button href={`/c/${slug}/agendar?servico=${svc.id}`} size="sm" className="mt-5 w-full">
        Agendar
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
