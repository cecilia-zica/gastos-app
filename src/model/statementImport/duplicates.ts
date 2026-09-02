import type { Expense } from "../types";

/**
 * Duplicata provavel: mesma data + mesmo valor ja lancado. A descricao nao
 * entra no criterio — texto digitado a mao ("Farmacia") raramente bate com
 * o texto do banco ("FARMACIA SAO JOAO FLORIANOPOLIS BRA").
 */
export function findLikelyDuplicate(
  row: { date: string; amountCents: number },
  existing: Expense[],
): Expense | undefined {
  return existing.find((e) => e.date === row.date && e.amountCents === row.amountCents);
}
