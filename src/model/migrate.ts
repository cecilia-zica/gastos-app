import { localOnlyStore } from "./store";
import { localOnlyRecurringStore } from "./recurringStore";
import type { FirebaseExpenseStore } from "./firebaseExpenseStore";
import type { FirebaseRecurringStore } from "./firebaseRecurringStore";
import type { Expense, NewRecurring, Recurring } from "./types";

function flagKey(uid: string): string {
  return `miudos-migrated-${uid}`;
}

function readOnce<T>(store: { subscribe(cb: (list: T[]) => void): () => void }): T[] {
  let snapshot: T[] = [];
  const unsub = store.subscribe((list) => {
    snapshot = list;
  });
  unsub();
  return snapshot;
}

/**
 * Migracao unica: na primeira vez que este uid loga, sobe o que ja tinha
 * sido anotado localmente (localStorage) pra nuvem. Idempotente via flag
 * em localStorage — nao roda de novo nos proximos logins deste navegador.
 */
export async function migrateLocalToCloud(
  cloudExpenses: FirebaseExpenseStore,
  cloudRecurring: FirebaseRecurringStore,
  uid: string,
): Promise<void> {
  if (localStorage.getItem(flagKey(uid))) return;

  const expenses = readOnce<Expense>(localOnlyStore);
  const recurrings = readOnce<Recurring>(localOnlyRecurringStore);

  if (expenses.length > 0) await cloudExpenses.upsertMany(expenses);
  if (recurrings.length > 0) {
    const inputs: NewRecurring[] = recurrings.map((r) => ({
      description: r.description,
      amountCents: r.amountCents,
      category: r.category,
      payment: r.payment,
      dayOfMonth: r.dayOfMonth,
      since: r.since,
      until: r.until,
    }));
    await cloudRecurring.importMany(inputs);
  }

  localStorage.setItem(flagKey(uid), "1");
}
