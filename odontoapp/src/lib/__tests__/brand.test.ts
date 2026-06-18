import { describe, it, expect } from "vitest";
import { hexToRgbTriplet, brandVars } from "@/lib/brand";

const FB = "1 2 3";

describe("hexToRgbTriplet", () => {
  it("converte hex de 6 dígitos", () => {
    expect(hexToRgbTriplet("#0ea5e9", FB)).toBe("14 165 233");
    expect(hexToRgbTriplet("0ea5e9", FB)).toBe("14 165 233");
  });

  it("expande hex de 3 dígitos", () => {
    expect(hexToRgbTriplet("#0e9", FB)).toBe("0 238 153");
  });

  it("usa fallback para valores inválidos/ausentes", () => {
    expect(hexToRgbTriplet(null, FB)).toBe(FB);
    expect(hexToRgbTriplet(undefined, FB)).toBe(FB);
    expect(hexToRgbTriplet("xyz", FB)).toBe(FB);
    expect(hexToRgbTriplet("#12345", FB)).toBe(FB);
    expect(hexToRgbTriplet("#gggggg", FB)).toBe(FB);
  });
});

describe("brandVars", () => {
  it("retorna as CSS vars da marca", () => {
    const vars = brandVars("#0ea5e9", "#0369a1") as Record<string, string>;
    expect(vars["--brand"]).toBe("14 165 233");
    expect(vars["--brand-2"]).toBe("3 105 161");
  });

  it("usa os defaults premium quando ausente", () => {
    const vars = brandVars(null, null) as Record<string, string>;
    expect(vars["--brand"]).toBe("13 148 136");
    expect(vars["--brand-2"]).toBe("8 145 178");
  });
});
