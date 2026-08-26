import { describe, it, expect } from "vitest";
import {
  occurrenceId,
  nextMonth,
  prevMonth,
  monthsRange,
  occurrencesForMonth,
  missingOccurrences,
} from "./recurring";
import type { Recurring } from "./types";

function rec(over: Partial<Recurring> = {}): Recurring {
  return {
    id: "r1",
    description: "Psi",
    amountCents: 36000,
    category: "Saúde",
    payment: "Pix",
    dayOfMonth: 5,
    since: "2026-07",
    until: null,
    ...over,
  };
}

describe("helpers de mês", () => {
  it("nextMonth vira o ano", () => expect(nextMonth("2026-12")).toBe("2027-01"));
  it("prevMonth vira o ano", () => expect(prevMonth("2026-01")).toBe("2025-12"));
  it("occurrenceId é determinístico", () =>
    expect(occurrenceId("r1", "2026-08")).toBe("rec:r1:2026-08"));
  it("monthsRange inclusivo", () =>
    expect(monthsRange("2026-07", "2026-10")).toEqual([
      "2026-07", "2026-08", "2026-09", "2026-10",
    ]));
});

describe("occurrencesForMonth", () => {
  it("gera ocorrência ativa com id e data certos", () => {
    const [e] = occurrencesForMonth([rec()], "2026-08");
    expect(e.id).toBe("rec:r1:2026-08");
    expect(e.date).toBe("2026-08-05");
    expect(e.amountCents).toBe(36000);
    expect(e.recurringId).toBe("r1");
  });
  it("respeita since (antes não gera)", () =>
    expect(occurrencesForMonth([rec()], "2026-06")).toHaveLength(0));
  it("respeita until (depois não gera)", () =>
    expect(occurrencesForMonth([rec({ until: "2026-08" })], "2026-09")).toHaveLength(0));
  it("clampa dia >28", () =>
    expect(occurrencesForMonth([rec({ dayOfMonth: 31 })], "2026-08")[0].date).toBe("2026-08-28"));
});

describe("missingOccurrences", () => {
  it("back-fill de since até o mês atual", () => {
    const occ = missingOccurrences([rec()], new Set(), "2026-09");
    // jul, ago, set
    expect(occ.map((e) => e.date)).toEqual(["2026-07-05", "2026-08-05", "2026-09-05"]);
  });
  it("não duplica o que já existe", () => {
    const occ = missingOccurrences([rec()], new Set(["rec:r1:2026-08"]), "2026-09");
    expect(occ.map((e) => e.id)).toEqual(["rec:r1:2026-07", "rec:r1:2026-09"]);
  });
  it("vazio quando não há fixos", () =>
    expect(missingOccurrences([], new Set(), "2026-09")).toEqual([]));
});
