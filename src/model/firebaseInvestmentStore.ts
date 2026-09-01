import { createFirebaseListStore } from "./createFirebaseListStore";
import { investmentSchema, type InvestmentStore } from "./investmentStore";

export function createFirebaseInvestmentStore(uid: string): InvestmentStore {
  return createFirebaseListStore(uid, "investments", investmentSchema);
}
