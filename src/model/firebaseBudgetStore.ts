import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";
import type { BudgetStore } from "./budgetStore";
import type { Budget } from "./types";

/** Tetos por categoria no Firestore — doc id = a propria categoria. */
export function createFirebaseBudgetStore(uid: string): BudgetStore {
  const col = collection(getDb(), "users", uid, "budgets");
  let cached: Budget[] = [];

  return {
    subscribe(cb) {
      return onSnapshot(col, (snap) => {
        cached = snap.docs.map((d) => d.data() as Budget);
        cb(cached);
      });
    },
    async setLimit(category, limitCents) {
      await setDoc(doc(col, category), { category, limitCents });
    },
    async removeLimit(category) {
      await deleteDoc(doc(col, category));
    },
    size() {
      return cached.length;
    },
  };
}
