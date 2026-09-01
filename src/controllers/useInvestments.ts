import { useEffect, useState } from "react";
import { investmentStore } from "../model/investmentStore";
import type { Investment, NewInvestment } from "../model/types";

/** Controller (MVC): ponte entre o model (investmentStore) e as views. */
export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    return investmentStore.subscribe(setInvestments);
  }, []);

  return {
    investments,
    add: (input: NewInvestment) => investmentStore.add(input),
    update: (id: string, patch: Partial<NewInvestment>) => investmentStore.update(id, patch),
    remove: (id: string) => investmentStore.remove(id),
  };
}
