import { useEffect, useState } from "react";
import { incomeStore } from "../model/incomeStore";
import type { Income, NewIncome } from "../model/types";

/** Controller (MVC): ponte entre o model (incomeStore) e as views. */
export function useIncome() {
  const [income, setIncome] = useState<Income[]>([]);

  useEffect(() => {
    return incomeStore.subscribe(setIncome);
  }, []);

  return {
    income,
    add: (input: NewIncome) => incomeStore.add(input),
    update: (id: string, patch: Partial<NewIncome>) => incomeStore.update(id, patch),
    remove: (id: string) => incomeStore.remove(id),
  };
}
