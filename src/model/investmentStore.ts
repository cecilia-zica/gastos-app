import { createLocalListStore, createRoutingListStore, type ListStore } from "./createListStore";
import type { Investment, NewInvestment } from "./types";

export type InvestmentStore = ListStore<Investment, NewInvestment>;

export const investmentSchema = {
  idPrefix: "inv-",
  makeItem: (input: NewInvestment, id: string, createdAt: number): Investment => ({
    ...input,
    id,
    createdAt,
  }),
};

/** Backend local puro — default e fonte de leitura na migracao pra nuvem. */
export const localOnlyInvestmentStore: InvestmentStore = createLocalListStore(
  "miudos-investment-v1",
  investmentSchema,
);

/** Instancia unica usada pelo app; setBackend() troca local <-> nuvem. */
export const investmentStore: InvestmentStore & { setBackend(next: InvestmentStore): void } =
  createRoutingListStore(localOnlyInvestmentStore);
