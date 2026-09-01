import { useMemo, useState } from "react";
import type { Budget, Expense, Income, Investment } from "../model/types";
import { buildDashboard, filterByPeriod, type Period } from "../model/analytics";
import { todayISO } from "../shared/format";

/**
 * Controller (MVC) do resumo: guarda o período escolhido e deriva os
 * dados agregados (model) pra view — inclui entradas/investido/tetos,
 * não só saídas.
 */
export function useDashboard(
  expenses: Expense[],
  income: Income[],
  investments: Investment[],
  budgets: Budget[],
) {
  const [period, setPeriod] = useState<Period>("month");
  const ref = todayISO();

  const data = useMemo(() => buildDashboard(filterByPeriod(expenses, period, ref)), [expenses, period, ref]);

  const incomeCents = useMemo(
    () => filterByPeriod(income, period, ref).reduce((s, i) => s + i.amountCents, 0),
    [income, period, ref],
  );

  const investedCents = useMemo(
    () => investments.reduce((s, i) => s + i.investedCents, 0),
    [investments],
  );
  const investedGoalCents = useMemo(
    () => investments.reduce((s, i) => s + i.goalCents, 0),
    [investments],
  );

  const savedCents = incomeCents - data.totalCents;

  return { period, setPeriod, data, incomeCents, investedCents, investedGoalCents, savedCents, budgets };
}
