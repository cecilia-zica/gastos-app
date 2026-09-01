import { createLocalListStore, createRoutingListStore, type ListStore } from "./createListStore";
import type { Income, NewIncome } from "./types";

export type IncomeStore = ListStore<Income, NewIncome>;

export const incomeSchema = {
  idPrefix: "inc-",
  makeItem: (input: NewIncome, id: string, createdAt: number): Income => ({
    ...input,
    id,
    createdAt,
    syncedToSheet: false,
  }),
  sort: (list: Income[]) =>
    [...list].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1)),
};

/** Backend local puro — default e fonte de leitura na migracao pra nuvem. */
export const localOnlyIncomeStore: IncomeStore = createLocalListStore(
  "miudos-income-v1",
  incomeSchema,
);

/** Instancia unica usada pelo app; setBackend() troca local <-> nuvem. */
export const incomeStore: IncomeStore & { setBackend(next: IncomeStore): void } =
  createRoutingListStore(localOnlyIncomeStore);
