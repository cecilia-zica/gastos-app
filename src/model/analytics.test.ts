import { describe, it, expect } from "vitest";
import {
  filterByPeriod,
  sumCents,
  dayAverageCents,
  topCategories,
  byPayment,
  monthlyTotals,
  maxExpense,
  minExpense,
  mostUsedPayment,
  buildDashboard,
} from "./analytics";
import type { Expense, Payment } from "./types";

let seq = 0;
function mk(
  date: string,
  cents: number,
  category: string,
  payment: Payment = "Débito",
): Expense {
  return {
    id: `id-${seq++}`,
    amountCents: cents,
    description: "",
    category,
    payment,
    date,
    createdAt: seq,
  };
}

const sample: Expense[] = [
  mk("2026-08-01", 1000, "Mercado", "Pix"),
  mk("2026-08-01", 500, "Lanches/cafés", "Dinheiro"),
  mk("2026-08-10", 2000, "Mercado", "Crédito"),
  mk("2026-07-05", 300, "Transporte", "Débito"),
  mk("2026-07-20", 700, "Mercado", "Pix"),
];

describe("sumCents", () => {
  it("soma vazio = 0", () => expect(sumCents([])).toBe(0));
  it("soma total", () => expect(sumCents(sample)).toBe(4500));
});

describe("filterByPeriod", () => {
  const ref = "2026-08-15";
  it("mes: só agosto", () => {
    const r = filterByPeriod(sample, "month", ref);
    expect(r).toHaveLength(3);
    expect(sumCents(r)).toBe(3500);
  });
  it("ano: 2026 inteiro", () => {
    expect(filterByPeriod(sample, "year", ref)).toHaveLength(5);
  });
  it("tudo: não filtra", () => {
    expect(filterByPeriod(sample, "all", ref)).toHaveLength(5);
  });
});

describe("dayAverageCents", () => {
  it("vazio = 0", () => expect(dayAverageCents([])).toBe(0));
  it("total ÷ dias distintos", () => {
    // agosto: dias 01 e 10 => 2 dias distintos, total 3500 => 1750
    expect(dayAverageCents(filterByPeriod(sample, "month", "2026-08-15"))).toBe(1750);
  });
});

describe("topCategories", () => {
  it("agrupa e ordena desc", () => {
    const r = topCategories(sample);
    expect(r[0]).toMatchObject({ category: "Mercado", cents: 3700, count: 3 });
    expect(r.map((c) => c.category)).toEqual([
      "Mercado",
      "Lanches/cafés",
      "Transporte",
    ]);
  });
  it("respeita limite", () => {
    expect(topCategories(sample, 1)).toHaveLength(1);
  });
  it("vazio = []", () => expect(topCategories([])).toEqual([]));
});

describe("byPayment", () => {
  it("soma por forma, ordena desc", () => {
    const r = byPayment(sample);
    // Pix 1700, Crédito 2000, Dinheiro 500, Débito 300
    expect(r[0]).toMatchObject({ payment: "Crédito", cents: 2000, count: 1 });
    expect(sumCents([])).toBe(0);
    const pix = r.find((p) => p.payment === "Pix");
    expect(pix).toMatchObject({ cents: 1700, count: 2 });
  });
});

describe("monthlyTotals", () => {
  it("agrupa por mês asc", () => {
    const r = monthlyTotals(sample);
    expect(r.map((m) => m.key)).toEqual(["2026-07", "2026-08"]);
    expect(r[0].cents).toBe(1000);
    expect(r[1].cents).toBe(3500);
    expect(r[0].label).toBe("jul");
  });
});

describe("max/min expense", () => {
  it("maior", () => expect(maxExpense(sample)?.amountCents).toBe(2000));
  it("menor", () => expect(minExpense(sample)?.amountCents).toBe(300));
  it("vazio = undefined", () => {
    expect(maxExpense([])).toBeUndefined();
    expect(minExpense([])).toBeUndefined();
  });
});

describe("mostUsedPayment", () => {
  it("por contagem", () => {
    // Pix aparece 2x, resto 1x
    expect(mostUsedPayment(sample)).toMatchObject({ payment: "Pix", count: 2 });
  });
  it("vazio = undefined", () => expect(mostUsedPayment([])).toBeUndefined());
});

describe("buildDashboard", () => {
  it("compõe sem quebrar em vazio", () => {
    const d = buildDashboard([]);
    expect(d.totalCents).toBe(0);
    expect(d.count).toBe(0);
    expect(d.topCategories).toEqual([]);
    expect(d.maxExpense).toBeUndefined();
  });
  it("compõe os números do sample", () => {
    const d = buildDashboard(sample);
    expect(d.totalCents).toBe(4500);
    expect(d.count).toBe(5);
    expect(d.topCategories[0].category).toBe("Mercado");
    expect(d.monthly).toHaveLength(2);
  });
});
