import { describe, expect, it } from "vitest";
import { findLikelyDuplicate } from "./duplicates";
import type { Expense } from "../types";

function mk(date: string, amountCents: number): Expense {
  return {
    id: `id-${date}-${amountCents}`,
    amountCents,
    description: "Farmácia",
    category: "Saúde",
    payment: "Crédito",
    date,
    createdAt: 1,
  };
}

const existing: Expense[] = [mk("2026-08-29", 799), mk("2026-08-10", 2000)];

describe("findLikelyDuplicate", () => {
  it("acha quando data e valor batem", () => {
    expect(findLikelyDuplicate({ date: "2026-08-29", amountCents: 799 }, existing)).toBe(existing[0]);
  });

  it("nao acha se so o valor bate", () => {
    expect(findLikelyDuplicate({ date: "2026-08-30", amountCents: 799 }, existing)).toBeUndefined();
  });

  it("nao acha se so a data bate", () => {
    expect(findLikelyDuplicate({ date: "2026-08-29", amountCents: 100 }, existing)).toBeUndefined();
  });

  it("lista vazia = undefined", () => {
    expect(findLikelyDuplicate({ date: "2026-08-29", amountCents: 799 }, [])).toBeUndefined();
  });
});
