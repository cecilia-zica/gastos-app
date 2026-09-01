/**
 * Fabrica generica da mesma costura usada em store.ts (LocalStorageStore +
 * RoutingStore) — extraida aqui porque Income e Investment precisam do
 * identico CRUD local<->nuvem sem repetir a classe inteira duas vezes.
 * Expense/Recurring continuam com suas implementacoes proprias (ja
 * funcionando, sem motivo pra arriscar mexer).
 */
export interface ListStore<T extends { id: string }, TNew> {
  /** Assina mudancas. Chama cb imediatamente com o estado atual. Retorna unsubscribe. */
  subscribe(cb: (items: T[]) => void): () => void;
  add(input: TNew): Promise<T>;
  update(id: string, patch: Partial<TNew>): Promise<void>;
  remove(id: string): Promise<void>;
  importMany(inputs: TNew[]): Promise<void>;
  size(): number;
}

export interface ListStoreSchema<T extends { id: string; createdAt: number }, TNew> {
  idPrefix: string;
  makeItem(input: TNew, id: string, createdAt: number): T;
  /** Ordenacao da lista; default = mais recente criado primeiro. */
  sort?(list: T[]): T[];
}

function makeId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultSort<T extends { createdAt: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

export function createLocalListStore<T extends { id: string; createdAt: number }, TNew>(
  storageKey: string,
  schema: ListStoreSchema<T, TNew>,
): ListStore<T, TNew> {
  const sort = schema.sort ?? defaultSort<T>;
  const listeners = new Set<(items: T[]) => void>();

  function read(): T[] {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  function write(list: T[]) {
    localStorage.setItem(storageKey, JSON.stringify(list));
    const snapshot = sort(list);
    listeners.forEach((cb) => cb(snapshot));
  }

  return {
    subscribe(cb) {
      listeners.add(cb);
      cb(sort(read()));
      const onStorage = (e: StorageEvent) => {
        if (e.key === storageKey) cb(sort(read()));
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    async add(input) {
      const item = schema.makeItem(input, makeId(schema.idPrefix), Date.now());
      write([item, ...read()]);
      return item;
    },
    async update(id, patch) {
      write(read().map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    async remove(id) {
      write(read().filter((it) => it.id !== id));
    },
    async importMany(inputs) {
      const now = Date.now();
      const novos = inputs.map((input, i) => schema.makeItem(input, makeId(schema.idPrefix), now + i));
      write([...novos, ...read()]);
    },
    size() {
      return read().length;
    },
  };
}

/**
 * Roteador de backend: mesma identidade de objeto pros controllers, so troca
 * o backend por baixo (local <-> Firestore) via setBackend() — ver
 * RoutingStore em store.ts pro raciocinio completo.
 */
export function createRoutingListStore<T extends { id: string }, TNew>(
  initial: ListStore<T, TNew>,
): ListStore<T, TNew> & { setBackend(next: ListStore<T, TNew>): void } {
  let backend = initial;
  const listeners = new Set<(items: T[]) => void>();
  let unsubBackend: (() => void) | null = null;
  let lastSnapshot: T[] = [];

  function setBackend(next: ListStore<T, TNew>) {
    unsubBackend?.();
    backend = next;
    unsubBackend = next.subscribe((list) => {
      lastSnapshot = list;
      listeners.forEach((cb) => cb(list));
    });
  }
  setBackend(initial);

  return {
    setBackend,
    subscribe(cb) {
      listeners.add(cb);
      cb(lastSnapshot);
      return () => listeners.delete(cb);
    },
    add: (input) => backend.add(input),
    update: (id, patch) => backend.update(id, patch),
    remove: (id) => backend.remove(id),
    importMany: (inputs) => backend.importMany(inputs),
    size: () => backend.size(),
  };
}
