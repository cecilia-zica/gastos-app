import { useEffect, useState } from "react";
import { store } from "../model/store";
import { loadSeedIfEmpty } from "../model/seed";
import type { Expense, NewExpense } from "../model/types";

/**
 * Controller (MVC): faz a ponte entre o model (store) e as views.
 * Expõe o estado dos gastos e as ações de CRUD, sem que as views
 * conheçam a persistência por baixo.
 */
export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const unsub = store.subscribe(setExpenses);
    void loadSeedIfEmpty(store);
    return unsub;
  }, []);

  return {
    expenses,
    add: (input: NewExpense) => store.add(input),
    update: (id: string, patch: Partial<NewExpense>) => store.update(id, patch),
    remove: (id: string) => store.remove(id),
    importMany: (inputs: NewExpense[]) => store.importMany(inputs),
  };
}
