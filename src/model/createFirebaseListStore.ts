import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  type CollectionReference,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { ListStore, ListStoreSchema } from "./createListStore";

function makeId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultSort<T extends { createdAt: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Fabrica generica do lado Firestore — mesma ideia de createListStore.ts,
 * namespaced por usuario (users/{uid}/{collectionName}). Sem orderBy no
 * servidor (evita indice composto): ordena no cliente com schema.sort.
 */
export function createFirebaseListStore<T extends { id: string; createdAt: number }, TNew>(
  uid: string,
  collectionName: string,
  schema: ListStoreSchema<T, TNew>,
): ListStore<T, TNew> {
  const sort = schema.sort ?? defaultSort<T>;
  const col = collection(getDb(), "users", uid, collectionName) as CollectionReference<
    Omit<T, "id">
  >;
  let cached: T[] = [];

  return {
    subscribe(cb) {
      return onSnapshot(col, (snap) => {
        const list = snap.docs.map((d) => ({ ...(d.data() as Omit<T, "id">), id: d.id }) as T);
        cached = sort(list);
        cb(cached);
      });
    },
    async add(input) {
      const item = schema.makeItem(input, makeId(schema.idPrefix), Date.now());
      await setDoc(doc(col, item.id), item as unknown as Omit<T, "id">);
      return item;
    },
    async update(id, patch) {
      await updateDoc(doc(col, id), patch as never);
    },
    async remove(id) {
      await deleteDoc(doc(col, id));
    },
    async importMany(inputs) {
      const now = Date.now();
      for (const [i, input] of inputs.entries()) {
        const item = schema.makeItem(input, makeId(schema.idPrefix), now + i);
        await setDoc(doc(col, item.id), item as unknown as Omit<T, "id">);
      }
    },
    size() {
      return cached.length;
    },
  };
}
