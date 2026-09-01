import { useEffect, useState } from "react";
import { budgetStore } from "../model/budgetStore";
import type { Budget } from "../model/types";

/** Controller (MVC): ponte entre o model (budgetStore) e as views. */
export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    return budgetStore.subscribe(setBudgets);
  }, []);

  return {
    budgets,
    setLimit: (category: string, limitCents: number) => budgetStore.setLimit(category, limitCents),
    removeLimit: (category: string) => budgetStore.removeLimit(category),
  };
}
