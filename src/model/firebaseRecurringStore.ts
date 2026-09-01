import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { RecurringStore } from "./recurringStore";
import type { NewRecurring, Recurring } from "./types";

function makeId(): string {
  return "rec-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

/** RecurringStore no Firestore, namespaced por usuario (users/{uid}/recurring). */
export class FirebaseRecurringStore implements RecurringStore {
  private col;
  private cached: Recurring[] = [];

  constructor(uid: string) {
    this.col = collection(getDb(), "users", uid, "recurring");
  }

  subscribe(cb: (items: Recurring[]) => void): () => void {
    return onSnapshot(this.col, (snap) => {
      this.cached = snap.docs.map((d) => ({ ...(d.data() as Omit<Recurring, "id">), id: d.id }));
      cb(this.cached);
    });
  }

  list(): Recurring[] {
    return this.cached;
  }

  size(): number {
    return this.cached.length;
  }

  async add(input: NewRecurring): Promise<Recurring> {
    const item: Recurring = { ...input, id: makeId() };
    await setDoc(doc(this.col, item.id), item);
    return item;
  }

  async update(id: string, patch: Partial<NewRecurring>): Promise<void> {
    await updateDoc(doc(this.col, id), patch);
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id));
  }

  async importMany(inputs: NewRecurring[]): Promise<void> {
    for (const input of inputs) {
      const item: Recurring = { ...input, id: makeId() };
      await setDoc(doc(this.col, item.id), item);
    }
  }
}
