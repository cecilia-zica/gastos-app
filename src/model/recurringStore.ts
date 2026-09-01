import type { NewRecurring, Recurring } from "./types";

/** Persistência dos templates de gasto fixo. localStorage hoje; Firestore na Fase 2. */
export interface RecurringStore {
  subscribe(cb: (items: Recurring[]) => void): () => void;
  list(): Recurring[];
  add(input: NewRecurring): Promise<Recurring>;
  update(id: string, patch: Partial<NewRecurring>): Promise<void>;
  remove(id: string): Promise<void>;
  importMany(inputs: NewRecurring[]): Promise<void>;
  size(): number;
}

const KEY = "miudos-recurring-v1";

function makeId(): string {
  return "rec-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

export class LocalRecurringStore implements RecurringStore {
  private listeners = new Set<(r: Recurring[]) => void>();

  private read(): Recurring[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Recurring[]) : [];
    } catch {
      return [];
    }
  }

  private write(list: Recurring[]) {
    localStorage.setItem(KEY, JSON.stringify(list));
    this.listeners.forEach((cb) => cb(list));
  }

  subscribe(cb: (items: Recurring[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.read());
    return () => this.listeners.delete(cb);
  }

  list(): Recurring[] {
    return this.read();
  }

  size(): number {
    return this.read().length;
  }

  async add(input: NewRecurring): Promise<Recurring> {
    const item: Recurring = { ...input, id: makeId() };
    this.write([...this.read(), item]);
    return item;
  }

  async update(id: string, patch: Partial<NewRecurring>): Promise<void> {
    this.write(this.read().map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((r) => r.id !== id));
  }

  async importMany(inputs: NewRecurring[]): Promise<void> {
    const novos = inputs.map((i) => ({ ...i, id: makeId() }));
    this.write([...this.read(), ...novos]);
  }
}

/** Roteador de backend: mesma ideia do RoutingStore em store.ts (ver comentario la). */
class RoutingRecurringStore implements RecurringStore {
  private backend: RecurringStore;
  private listeners = new Set<(r: Recurring[]) => void>();
  private unsubBackend: (() => void) | null = null;
  private lastSnapshot: Recurring[] = [];

  constructor(initial: RecurringStore) {
    this.backend = initial;
    this.setBackend(initial);
  }

  setBackend(next: RecurringStore) {
    this.unsubBackend?.();
    this.backend = next;
    this.unsubBackend = next.subscribe((list) => {
      this.lastSnapshot = list;
      this.listeners.forEach((cb) => cb(list));
    });
  }

  subscribe(cb: (items: Recurring[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.lastSnapshot);
    return () => this.listeners.delete(cb);
  }

  list(): Recurring[] {
    return this.backend.list();
  }

  size(): number {
    return this.backend.size();
  }

  add(input: NewRecurring): Promise<Recurring> {
    return this.backend.add(input);
  }

  update(id: string, patch: Partial<NewRecurring>): Promise<void> {
    return this.backend.update(id, patch);
  }

  remove(id: string): Promise<void> {
    return this.backend.remove(id);
  }

  importMany(inputs: NewRecurring[]): Promise<void> {
    return this.backend.importMany(inputs);
  }
}

/** Backend local puro — usado como default e pra ler dados na migracao pra nuvem. */
export const localOnlyRecurringStore: RecurringStore = new LocalRecurringStore();

/** Instancia unica usada pelo app hoje; setBackend() troca local <-> nuvem. */
export const recurringStore: RecurringStore & { setBackend(next: RecurringStore): void } =
  new RoutingRecurringStore(localOnlyRecurringStore);
