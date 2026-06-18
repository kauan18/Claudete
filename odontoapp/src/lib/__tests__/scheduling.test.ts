import { describe, it, expect } from "vitest";
import { overlaps } from "@/lib/scheduling";

const d = (iso: string) => new Date(iso);

describe("overlaps", () => {
  it("detecta sobreposição direta", () => {
    expect(
      overlaps(d("2026-06-15T10:00:00Z"), d("2026-06-15T11:00:00Z"), d("2026-06-15T10:30:00Z"), d("2026-06-15T11:30:00Z"), 0),
    ).toBe(true);
  });

  it("intervalos adjacentes não se sobrepõem sem buffer", () => {
    expect(
      overlaps(d("2026-06-15T10:00:00Z"), d("2026-06-15T11:00:00Z"), d("2026-06-15T11:00:00Z"), d("2026-06-15T12:00:00Z"), 0),
    ).toBe(false);
  });

  it("o buffer cria conflito entre intervalos próximos", () => {
    const buffer = 15 * 60 * 1000; // 15 min
    expect(
      overlaps(d("2026-06-15T10:00:00Z"), d("2026-06-15T11:00:00Z"), d("2026-06-15T11:10:00Z"), d("2026-06-15T12:00:00Z"), buffer),
    ).toBe(true);
  });

  it("fora do buffer não há conflito", () => {
    const buffer = 15 * 60 * 1000;
    expect(
      overlaps(d("2026-06-15T10:00:00Z"), d("2026-06-15T11:00:00Z"), d("2026-06-15T11:20:00Z"), d("2026-06-15T12:00:00Z"), buffer),
    ).toBe(false);
  });
});
