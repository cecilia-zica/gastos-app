import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { sortExpenses, type ExpenseStore } from "./store";
import type { Expense, NewExpense } from "./types";

function makeId(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

/**
 * ExpenseStore no Firestore, namespaced por usuario (users/{uid}/expenses).
 * MESMA interface do LocalStorageStore — nenhum controller/view muda.
 * Ordena so por "date" no servidor (evita indice composto) e desempata
 * por createdAt no cliente, com a mesma sortExpenses() do backend local.
 */
export class FirebaseExpenseStore implements ExpenseStore {
  private col;
  private cached: Expense[] = [];

  constructor(uid: string) {
    this.col = collection(getDb(), "users", uid, "expenses");
  }

  subscribe(cb: (expenses: Expense[]) => void): () => void {
    const q = query(this.col, orderBy("date", "desc"));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ ...(d.data() as Omit<Expense, "id">), id: d.id }));
      this.cached = sortExpenses(list);
      cb(this.cached);
    });
  }

  async add(input: NewExpense): Promise<Expense> {
    const expense: Expense = {
      ...input,
      id: makeId(),
      createdAt: Date.now(),
      syncedToSheet: false,
    };
    await setDoc(doc(this.col, expense.id), expense);
    return expense;
  }

  async update(id: string, patch: Partial<NewExpense>): Promise<void> {
    await updateDoc(doc(this.col, id), patch);
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id));
  }

  async importMany(inputs: NewExpense[]): Promise<void> {
    const now = Date.now();
    const batch = writeBatch(getDb());
    inputs.forEach((input, i) => {
      const expense: Expense = {
        ...input,
        id: makeId(),
        createdAt: now + i,
        syncedToSheet: false,
      };
      batch.set(doc(this.col, expense.id), expense);
    });
    await batch.commit();
  }

  async upsertMany(items: Expense[]): Promise<void> {
    if (items.length === 0) return;
    const existing = new Set((await getDocs(this.col)).docs.map((d) => d.id));
    const novos = items.filter((e) => !existing.has(e.id));
    if (novos.length === 0) return;
    const batch = writeBatch(getDb());
    novos.forEach((e) => batch.set(doc(this.col, e.id), e));
    await batch.commit();
  }

  size(): number {
    return this.cached.length;
  }
}
