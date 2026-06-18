import { describe, it, expect } from "vitest";
import { slotTimes, dayKeyForDate, zonedWallToUtc, isWithinHours } from "@/lib/availability";

describe("slotTimes", () => {
  it("gera horários cabendo a duração", () => {
    expect(slotTimes("08:00", "10:00", 60, 30)).toEqual(["08:00", "08:30", "09:00"]);
  });
  it("retorna vazio quando a duração não cabe", () => {
    expect(slotTimes("08:00", "08:30", 60, 30)).toEqual([]);
  });
});

describe("dayKeyForDate", () => {
  it("calcula o dia da semana (independente de fuso)", () => {
    expect(dayKeyForDate("2026-01-01")).toBe("thu");
    // 2026-06-15 é segunda-feira
    expect(dayKeyForDate("2026-06-15")).toBe("mon");
  });
});

describe("zonedWallToUtc", () => {
  it("converte horário local de São Paulo (UTC-3) para UTC", () => {
    const utc = zonedWallToUtc("2026-06-15", "10:00");
    expect(utc.getUTCHours()).toBe(13);
  });
});

describe("isWithinHours", () => {
  const day = dayKeyForDate("2026-06-15"); // segunda
  const open = { [day]: ["08:00", "18:00"] as [string, string] };

  it("dentro do horário (10h-11h local)", () => {
    expect(isWithinHours(open, new Date("2026-06-15T13:00:00Z"), new Date("2026-06-15T14:00:00Z"))).toBe(true);
  });
  it("fora do horário (20h local)", () => {
    expect(isWithinHours(open, new Date("2026-06-15T23:00:00Z"), new Date("2026-06-15T23:30:00Z"))).toBe(false);
  });
  it("dia fechado retorna false", () => {
    expect(isWithinHours({ [day]: null }, new Date("2026-06-15T13:00:00Z"), new Date("2026-06-15T14:00:00Z"))).toBe(false);
  });
  it("sem configuração de horários retorna false", () => {
    expect(isWithinHours(null, new Date("2026-06-15T13:00:00Z"), new Date("2026-06-15T14:00:00Z"))).toBe(false);
  });
});
