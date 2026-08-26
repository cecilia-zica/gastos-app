import { useEffect, useState } from "react";
import { recurringStore } from "../model/recurringStore";
import { store } from "../model/store";
import { loadFixosSeedIfEmpty } from "../model/seed";
import { missingOccurrences, prevMonth } from "../model/recurring";
import { monthKey, todayISO } from "../shared/format";
import type { Expense, NewRecurring, Recurring } from "../model/types";

/**
 * Controller (MVC) dos gastos fixos recorrentes.
 * - materializa as ocorrências que faltam (back-fill + mês atual → "automático");
 * - editar/remover valem "daqui pra frente": passado fica intacto.
 */
export function useRecurring(expenses: Expense[]) {
  const [recurrings, setRecurrings] = useState<Recurring[]>([]);

  useEffect(() => {
    const unsub = recurringStore.subscribe(setRecurrings);
    void loadFixosSeedIfEmpty(recurringStore);
    return unsub;
  }, []);

  const current = monthKey(todayISO());

  // materializa o que falta sempre que templates/lançamentos mudam
  useEffect(() => {
    if (recurrings.length === 0) return;
    const existing = new Set(expenses.map((e) => e.id));
    const missing = missingOccurrences(recurrings, existing, current);
    if (missing.length) void store.upsertMany(missing);
  }, [recurrings, expenses, current]);

  /** apaga ocorrências deste fixo do mês atual em diante (passado fica). */
  async function clearFromNow(id: string) {
    for (const e of expenses) {
      if (e.recurringId === id && monthKey(e.date) >= current) {
        await store.remove(e.id);
      }
    }
  }

  async function add(input: NewRecurring) {
    await recurringStore.add(input);
  }

  /** edita o template; muda daqui pra frente (recria ocorrências >= mês atual). */
  async function edit(id: string, patch: Partial<NewRecurring>) {
    await recurringStore.update(id, patch);
    await clearFromNow(id); // o efeito recria com os novos valores
  }

  /** encerra o fixo a partir do mês atual (passado permanece). */
  async function remove(id: string) {
    const rec = recurrings.find((r) => r.id === id);
    await clearFromNow(id);
    if (rec && rec.since >= current) {
      await recurringStore.remove(id); // nunca teve passado → some de vez
    } else {
      await recurringStore.update(id, { until: prevMonth(current) });
    }
  }

  return { recurrings, add, edit, remove };
}
