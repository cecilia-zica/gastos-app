import { createFirebaseListStore } from "./createFirebaseListStore";
import { incomeSchema, type IncomeStore } from "./incomeStore";

export function createFirebaseIncomeStore(uid: string): IncomeStore {
  return createFirebaseListStore(uid, "income", incomeSchema);
}
