import type { Expense, NewExpense } from "./types";

/**
 * Contrato de persistencia do app.
 *
 * ESTA E A COSTURA ("seam") que isola o resto do app do backend.
 * Hoje: LocalStorageStore (funciona offline, sozinho, sem conta).
 * Fase 2: FirestoreStore implementa a MESMA interface -> troca de 1 linha
 * em App.tsx, sem tocar em nenhum componente. Ver BACKLOG.md.
 */
export interface ExpenseStore {
  /** Assina mudancas. Chama cb imediatamente com o estado atual. Retorna unsubscribe. */
  subscribe(cb: (expenses: Expense[]) => void): () => void;
  add(input: NewExpense): Promise<Expense>;
  update(id: string, patch: Partial<NewExpense>): Promise<void>;
  remove(id: string): Promise<void>;
  /** Importa vários de uma vez (ex: seed da planilha). Não notifica por item. */
  importMany(inputs: NewExpense[]): Promise<void>;
  /** Insere expenses com id próprio; ignora os que já existem (idempotente). */
  upsertMany(items: Expense[]): Promise<void>;
  /** Quantidade atual — usado para semear só quando vazio. */
  size(): number;
}

const KEY = "miudos-expenses-v1";

function makeId(): string {
  // Estavel e unico; sera tambem a chave da linha na planilha (Fase 2).
  return (
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)
  );
}

/** Ordena mais recente primeiro (por data do gasto, desempata por criacao). */
export function sortExpenses(list: Expense[]): Expense[] {
  return [...list].sort((a, b) =>
    a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1,
  );
}

export class LocalStorageStore implements ExpenseStore {
  private listeners = new Set<(e: Expense[]) => void>();

  private read(): Expense[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Expense[]) : [];
    } catch {
      return [];
    }
  }

  private write(list: Expense[]) {
    localStorage.setItem(KEY, JSON.stringify(list));
    const snapshot = sortExpenses(list);
    this.listeners.forEach((cb) => cb(snapshot));
  }

  subscribe(cb: (expenses: Expense[]) => void): () => void {
    this.listeners.add(cb);
    cb(sortExpenses(this.read()));
    // Sincroniza entre abas/janelas do mesmo dispositivo.
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) cb(sortExpenses(this.read()));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      this.listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }

  async add(input: NewExpense): Promise<Expense> {
    const expense: Expense = {
      ...input,
      id: makeId(),
      createdAt: Date.now(),
      syncedToSheet: false,
    };
    this.write([expense, ...this.read()]);
    return expense;
  }

  async update(id: string, patch: Partial<NewExpense>): Promise<void> {
    this.write(
      this.read().map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((e) => e.id !== id));
  }

  size(): number {
    return this.read().length;
  }

  async importMany(inputs: NewExpense[]): Promise<void> {
    const now = Date.now();
    const novos: Expense[] = inputs.map((input, i) => ({
      ...input,
      id: makeId(),
      createdAt: now + i,
      syncedToSheet: false,
    }));
    this.write([...novos, ...this.read()]);
  }

  async upsertMany(items: Expense[]): Promise<void> {
    const cur = this.read();
    const have = new Set(cur.map((e) => e.id));
    const novos = items.filter((e) => !have.has(e.id));
    if (novos.length === 0) return;
    this.write([...novos, ...cur]);
  }
}

/**
 * Roteador de backend: mantem a MESMA identidade/objeto que os controllers
 * assinam (useExpenses), so troca o backend por baixo (local <-> Firestore)
 * via setBackend(). Assim App.tsx troca de fonte de dados no login/logout
 * sem que nenhum controller ou view precise saber disso.
 */
class RoutingStore implements ExpenseStore {
  private backend: ExpenseStore;
  private listeners = new Set<(e: Expense[]) => void>();
  private unsubBackend: (() => void) | null = null;
  private lastSnapshot: Expense[] = [];

  constructor(initial: ExpenseStore) {
    this.backend = initial;
    this.setBackend(initial);
  }

  setBackend(next: ExpenseStore) {
    this.unsubBackend?.();
    this.backend = next;
    this.unsubBackend = next.subscribe((list) => {
      this.lastSnapshot = list;
      this.listeners.forEach((cb) => cb(list));
    });
  }

  subscribe(cb: (expenses: Expense[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.lastSnapshot);
    return () => this.listeners.delete(cb);
  }

  add(input: NewExpense): Promise<Expense> {
    return this.backend.add(input);
  }

  update(id: string, patch: Partial<NewExpense>): Promise<void> {
    return this.backend.update(id, patch);
  }

  remove(id: string): Promise<void> {
    return this.backend.remove(id);
  }

  importMany(inputs: NewExpense[]): Promise<void> {
    return this.backend.importMany(inputs);
  }

  upsertMany(items: Expense[]): Promise<void> {
    return this.backend.upsertMany(items);
  }

  size(): number {
    return this.backend.size();
  }
}

/** Backend local puro — usado como default e pra ler dados na migracao pra nuvem. */
export const localOnlyStore: ExpenseStore = new LocalStorageStore();

/** Instancia unica usada pelo app hoje; setBackend() troca local <-> nuvem. */
export const store: ExpenseStore & { setBackend(next: ExpenseStore): void } =
  new RoutingStore(localOnlyStore);
