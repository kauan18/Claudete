import { describe, it, expect } from "vitest";
import { makeCancelToken, verifyCancelToken, cancelPath } from "@/lib/appointmentToken";

describe("appointmentToken", () => {
  it("token válido verifica para o mesmo id", () => {
    const t = makeCancelToken("appt-1");
    expect(verifyCancelToken("appt-1", t)).toBe(true);
  });

  it("token de outro id não verifica (impede enumeração)", () => {
    const t = makeCancelToken("appt-1");
    expect(verifyCancelToken("appt-2", t)).toBe(false);
  });

  it("token ausente/adulterado falha", () => {
    expect(verifyCancelToken("appt-1", null)).toBe(false);
    expect(verifyCancelToken("appt-1", "")).toBe(false);
    expect(verifyCancelToken("appt-1", "lixo")).toBe(false);
  });

  it("cancelPath embute slug, id e token", () => {
    const p = cancelPath("sorriso-perfeito", "appt-1");
    expect(p.startsWith("/c/sorriso-perfeito/agendamento/appt-1?t=")).toBe(true);
    const token = p.split("t=")[1];
    expect(verifyCancelToken("appt-1", token)).toBe(true);
  });
});
