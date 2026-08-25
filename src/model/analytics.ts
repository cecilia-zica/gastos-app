import type { Expense, Payment } from "./types";
import { monthKey } from "../shared/format";

/** Agregacoes puras para o dashboard. Sem React — testaveis isoladamente. */

export type Period = "month" | "year" | "all";

export interface CatAgg {
  category: string;
  cents: number;
  count: number;
}
export interface PayAgg {
  payment: Payment;
  cents: number;
  count: number;
}
export interface MonthAgg {
  key: string; // "YYYY-MM"
  label: string; // "jan".."dez"
  cents: number;
}

const MES_ABBR = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export function filterByPeriod(
  expenses: Expense[],
  period: Period,
  refISO: string,
): Expense[] {
  if (period === "all") return expenses;
  const key = period === "month" ? refISO.slice(0, 7) : refISO.slice(0, 4);
  const len = period === "month" ? 7 : 4;
  return expenses.filter((e) => e.date.slice(0, len) === key);
}

export function sumCents(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amountCents, 0);
}

/** Media por dia = total / numero de dias distintos com gasto. */
export function dayAverageCents(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const days = new Set(expenses.map((e) => e.date));
  return Math.round(sumCents(expenses) / days.size);
}

export function topCategories(expenses: Expense[], limit?: number): CatAgg[] {
  const map = new Map<string, CatAgg>();
  for (const e of expenses) {
    const cur = map.get(e.category) ?? { category: e.category, cents: 0, count: 0 };
    cur.cents += e.amountCents;
    cur.count += 1;
    map.set(e.category, cur);
  }
  const sorted = [...map.values()].sort((a, b) => b.cents - a.cents);
  return limit ? sorted.slice(0, limit) : sorted;
}

export function byPayment(expenses: Expense[]): PayAgg[] {
  const map = new Map<Payment, PayAgg>();
  for (const e of expenses) {
    const cur = map.get(e.payment) ?? { payment: e.payment, cents: 0, count: 0 };
    cur.cents += e.amountCents;
    cur.count += 1;
    map.set(e.payment, cur);
  }
  return [...map.values()].sort((a, b) => b.cents - a.cents);
}

export function monthlyTotals(expenses: Expense[]): MonthAgg[] {
  const map = new Map<string, number>();
  for (const e of expenses) {
    const k = monthKey(e.date);
    map.set(k, (map.get(k) ?? 0) + e.amountCents);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, cents]) => ({
      key,
      cents,
      label: MES_ABBR[Number(key.slice(5, 7)) - 1],
    }));
}

export function maxExpense(expenses: Expense[]): Expense | undefined {
  return expenses.reduce<Expense | undefined>(
    (best, e) => (!best || e.amountCents > best.amountCents ? e : best),
    undefined,
  );
}

export function minExpense(expenses: Expense[]): Expense | undefined {
  return expenses.reduce<Expense | undefined>(
    (best, e) => (!best || e.amountCents < best.amountCents ? e : best),
    undefined,
  );
}

export function mostUsedPayment(
  expenses: Expense[],
): { payment: Payment; count: number } | undefined {
  const counts = new Map<Payment, number>();
  for (const e of expenses) counts.set(e.payment, (counts.get(e.payment) ?? 0) + 1);
  let best: { payment: Payment; count: number } | undefined;
  for (const [payment, count] of counts) {
    if (!best || count > best.count) best = { payment, count };
  }
  return best;
}

export interface Dashboard {
  totalCents: number;
  count: number;
  dayAverageCents: number;
  topCategories: CatAgg[];
  byPayment: PayAgg[];
  monthly: MonthAgg[];
  maxExpense: Expense | undefined;
  minExpense: Expense | undefined;
  mostUsedPayment: { payment: Payment; count: number } | undefined;
}

export function buildDashboard(expenses: Expense[]): Dashboard {
  return {
    totalCents: sumCents(expenses),
    count: expenses.length,
    dayAverageCents: dayAverageCents(expenses),
    topCategories: topCategories(expenses),
    byPayment: byPayment(expenses),
    monthly: monthlyTotals(expenses),
    maxExpense: maxExpense(expenses),
    minExpense: minExpense(expenses),
    mostUsedPayment: mostUsedPayment(expenses),
  };
}
