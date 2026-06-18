import { describe, it, expect } from "vitest";
import { STATUS_LABELS, statusBadge } from "@/lib/appointmentStatus";

describe("appointmentStatus", () => {
  it("rótulos conhecidos", () => {
    expect(STATUS_LABELS.solicitado).toBe("Solicitado");
    expect(STATUS_LABELS.nao_compareceu).toBe("Não compareceu");
  });

  it("statusBadge retorna classe por status", () => {
    expect(statusBadge("confirmado")).toContain("text-success");
    expect(statusBadge("cancelado")).toContain("text-danger");
  });

  it("statusBadge cai no neutro para status desconhecido", () => {
    expect(statusBadge("inexistente")).toBe("bg-subtle text-ink-muted");
  });
});
