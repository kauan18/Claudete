import { describe, it, expect } from "vitest";
import { getPlan, isPlanId, PLANS, PLAN_ORDER } from "@/lib/plans";

describe("plans", () => {
  it("tem os três níveis na ordem certa", () => {
    expect(PLAN_ORDER).toEqual(["basico", "pro", "premium"]);
  });

  it("preços e limites por plano", () => {
    expect(PLANS.basico.price).toBe(99);
    expect(PLANS.pro.price).toBe(199);
    expect(PLANS.premium.price).toBe(349);

    expect(PLANS.basico.maxProfessionals).toBe(1);
    expect(PLANS.pro.maxProfessionals).toBeNull();
    expect(PLANS.premium.maxProfessionals).toBeNull();
  });

  it("recursos por plano (whatsapp/ia)", () => {
    expect(PLANS.basico.whatsapp).toBe(false);
    expect(PLANS.basico.ai).toBe(false);
    expect(PLANS.pro.whatsapp).toBe(true);
    expect(PLANS.pro.ai).toBe(false);
    expect(PLANS.premium.whatsapp).toBe(true);
    expect(PLANS.premium.ai).toBe(true);
  });

  it("getPlan cai no básico para valores inválidos/ausentes", () => {
    expect(getPlan("pro").id).toBe("pro");
    expect(getPlan("xyz").id).toBe("basico");
    expect(getPlan(null).id).toBe("basico");
    expect(getPlan(undefined).id).toBe("basico");
  });

  it("isPlanId valida corretamente", () => {
    expect(isPlanId("basico")).toBe(true);
    expect(isPlanId("premium")).toBe(true);
    expect(isPlanId("enterprise")).toBe(false);
    expect(isPlanId(null)).toBe(false);
  });
});
