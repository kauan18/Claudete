/** Rótulos e estilos (theme-aware) dos status de agendamento — fonte única. */

export const STATUS_LABELS: Record<string, string> = {
  solicitado: "Solicitado",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  concluido: "Concluído",
  nao_compareceu: "Não compareceu",
};

/** Classes do badge por status (usa tokens de estado com tint translúcido). */
export const STATUS_BADGE: Record<string, string> = {
  solicitado: "bg-info/15 text-info",
  confirmado: "bg-success/15 text-success",
  cancelado: "bg-danger/15 text-danger",
  concluido: "bg-subtle text-ink-muted",
  nao_compareceu: "bg-warning/15 text-warning",
};

export function statusBadge(status: string): string {
  return STATUS_BADGE[status] ?? "bg-subtle text-ink-muted";
}
