import { useMemo, useState } from "react";
import type { Expense } from "../model/types";
import { buildDashboard, filterByPeriod, type Period } from "../model/analytics";
import { todayISO } from "../shared/format";

/**
 * Controller (MVC) do resumo: guarda o período escolhido e deriva os
 * dados agregados (model) para a view do dashboard.
 */
export function useDashboard(expenses: Expense[]) {
  const [period, setPeriod] = useState<Period>("month");

  const data = useMemo(
    () => buildDashboard(filterByPeriod(expenses, period, todayISO())),
    [expenses, period],
  );

  return { period, setPeriod, data };
}
