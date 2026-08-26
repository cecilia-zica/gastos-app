import type { Expense, Recurring } from "./types";

/** Materialização de gastos fixos — puro, testável, sem React. */

const pad2 = (n: number) => String(n).padStart(2, "0");

/** id determinístico de uma ocorrência → idempotente (não duplica). */
export function occurrenceId(recurringId: string, month: string): string {
  return `rec:${recurringId}:${month}`;
}

/** "YYYY-MM" -> próximo mês. */
export function nextMonth(month: string): string {
  let [y, m] = month.split("-").map(Number);
  m += 1;
  if (m > 12) { m = 1; y += 1; }
  return `${y}-${pad2(m)}`;
}

/** "YYYY-MM" -> mês anterior. */
export function prevMonth(month: string): string {
  let [y, m] = month.split("-").map(Number);
  m -= 1;
  if (m < 1) { m = 12; y -= 1; }
  return `${y}-${pad2(m)}`;
}

/** Lista de meses "YYYY-MM" de `from` até `to` inclusive (from<=to). */
export function monthsRange(from: string, to: string): string[] {
  const out: string[] = [];
  let cur = from;
  while (cur <= to) {
    out.push(cur);
    cur = nextMonth(cur);
    if (out.length > 600) break; // trava de segurança
  }
  return out;
}

function active(rec: Recurring, month: string): boolean {
  return rec.since <= month && (rec.until === null || month <= rec.until);
}

/** Ocorrências (Expense) de todos os fixos ativos num mês. */
export function occurrencesForMonth(recurrings: Recurring[], month: string): Expense[] {
  return recurrings.filter((r) => active(r, month)).map((r) => {
    const date = `${month}-${pad2(Math.min(Math.max(r.dayOfMonth, 1), 28))}`;
    return {
      id: occurrenceId(r.id, month),
      amountCents: r.amountCents,
      description: r.description,
      category: r.category,
      payment: r.payment,
      date,
      createdAt: new Date(date).getTime(),
      syncedToSheet: false,
      recurringId: r.id,
    };
  });
}

/**
 * Ocorrências que faltam materializar, do `since` mais antigo até `upto`
 * (mês atual), pulando as que já existem (por id).
 */
export function missingOccurrences(
  recurrings: Recurring[],
  existingIds: Set<string>,
  upto: string,
): Expense[] {
  if (recurrings.length === 0) return [];
  const earliest = recurrings.reduce((min, r) => (r.since < min ? r.since : min), recurrings[0].since);
  const from = earliest < upto ? earliest : upto;
  const out: Expense[] = [];
  for (const month of monthsRange(from, upto)) {
    for (const occ of occurrencesForMonth(recurrings, month)) {
      if (!existingIds.has(occ.id)) out.push(occ);
    }
  }
  return out;
}
