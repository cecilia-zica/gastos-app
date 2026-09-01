import type { Budget } from "./types";

/** Tetos de gasto por categoria. Chave e a propria categoria (1 por categoria). */
export interface BudgetStore {
  subscribe(cb: (budgets: Budget[]) => void): () => void;
  setLimit(category: string, limitCents: number): Promise<void>;
  removeLimit(category: string): Promise<void>;
  size(): number;
}

const KEY = "miudos-budget-v1";

export class LocalBudgetStore implements BudgetStore {
  private listeners = new Set<(b: Budget[]) => void>();

  private read(): Budget[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Budget[]) : [];
    } catch {
      return [];
    }
  }

  private write(list: Budget[]) {
    localStorage.setItem(KEY, JSON.stringify(list));
    this.listeners.forEach((cb) => cb(list));
  }

  subscribe(cb: (budgets: Budget[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) cb(this.read());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      this.listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }

  async setLimit(category: string, limitCents: number): Promise<void> {
    const list = this.read().filter((b) => b.category !== category);
    list.push({ category, limitCents });
    this.write(list);
  }

  async removeLimit(category: string): Promise<void> {
    this.write(this.read().filter((b) => b.category !== category));
  }

  size(): number {
    return this.read().length;
  }
}

/** Roteador de backend — mesma ideia de RoutingStore em store.ts. */
class RoutingBudgetStore implements BudgetStore {
  private backend: BudgetStore;
  private listeners = new Set<(b: Budget[]) => void>();
  private unsubBackend: (() => void) | null = null;
  private lastSnapshot: Budget[] = [];

  constructor(initial: BudgetStore) {
    this.backend = initial;
    this.setBackend(initial);
  }

  setBackend(next: BudgetStore) {
    this.unsubBackend?.();
    this.backend = next;
    this.unsubBackend = next.subscribe((list) => {
      this.lastSnapshot = list;
      this.listeners.forEach((cb) => cb(list));
    });
  }

  subscribe(cb: (budgets: Budget[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.lastSnapshot);
    return () => this.listeners.delete(cb);
  }

  setLimit(category: string, limitCents: number): Promise<void> {
    return this.backend.setLimit(category, limitCents);
  }

  removeLimit(category: string): Promise<void> {
    return this.backend.removeLimit(category);
  }

  size(): number {
    return this.backend.size();
  }
}

/** Backend local puro — default e fonte de leitura na migracao pra nuvem. */
export const localOnlyBudgetStore: BudgetStore = new LocalBudgetStore();

/** Instancia unica usada pelo app; setBackend() troca local <-> nuvem. */
export const budgetStore: BudgetStore & { setBackend(next: BudgetStore): void } =
  new RoutingBudgetStore(localOnlyBudgetStore);
