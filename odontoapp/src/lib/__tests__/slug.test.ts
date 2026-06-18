import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("normaliza acentos e espaços", () => {
    expect(slugify("Clínica Sorriso Perfeito")).toBe("clinica-sorriso-perfeito");
    expect(slugify("Odontologia & Estética")).toBe("odontologia-estetica");
  });

  it("remove hífens nas pontas e colapsa separadores", () => {
    expect(slugify("  --Olá Mundo--  ")).toBe("ola-mundo");
    expect(slugify("a___b   c")).toBe("a-b-c");
  });

  it("retorna string vazia para entrada só de símbolos", () => {
    expect(slugify("---")).toBe("");
    expect(slugify("@@@")).toBe("");
  });

  it("mantém números", () => {
    expect(slugify("Clínica 24h")).toBe("clinica-24h");
  });
});
