import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, NotebookPen } from "lucide-react";
import Summary from "./components/Summary";
import QuickAdd, { type Draft } from "./components/QuickAdd";
import EntryList from "./components/EntryList";
import { store } from "./lib/store";
import { DEFAULT_CATEGORY, DEFAULT_PAYMENT } from "./lib/config";
import { monthKey, monthName, todayISO } from "./lib/format";
import type { Expense } from "./types";

function emptyDraft(): Draft {
  return {
    cents: 0,
    description: "",
    date: todayISO(),
    category: DEFAULT_CATEGORY,
    payment: DEFAULT_PAYMENT,
  };
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => store.subscribe(setExpenses), []);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const today = todayISO();
  const thisMonth = monthKey(today);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === thisMonth),
    [expenses, thisMonth],
  );
  const todayExpenses = useMemo(
    () => expenses.filter((e) => e.date === today),
    [expenses, today],
  );

  const monthTotal = monthExpenses.reduce((s, e) => s + e.amountCents, 0);
  const todayTotal = todayExpenses.reduce((s, e) => s + e.amountCents, 0);

  function showToast(msg: string) {
    setToast(msg);
    window.clearTimeout((showToast as unknown as { t?: number }).t);
    (showToast as unknown as { t?: number }).t = window.setTimeout(
      () => setToast(null),
      1900,
    );
  }

  async function save() {
    if (draft.cents <= 0) return;
    await store.add({
      amountCents: draft.cents,
      description: draft.description.trim(),
      category: draft.category,
      payment: draft.payment,
      date: draft.date,
    });
    // mantem categoria/pagamento/data para lancamentos em sequencia
    setDraft((d) => ({ ...d, cents: 0, description: "" }));
    showToast("Gasto salvo");
  }

  const canSave = draft.cents > 0;

  return (
    <div className="mx-auto min-h-screen max-w-[460px] px-4 pb-32 pt-6">
      <header className="rise mb-5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="stamp grid h-9 w-9 place-items-center rounded-xl bg-accent text-white shadow-pop">
            <NotebookPen size={18} strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-lg font-bold tracking-tight">Miúdos</h1>
            <p className="text-xs font-medium text-muted">seus gastos do dia</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-5">
        <Summary
          monthLabel={monthName(today)}
          monthTotalCents={monthTotal}
          count={monthExpenses.length}
          todayCents={todayTotal}
        />

        <QuickAdd draft={draft} set={set} />

        <div className="rise" style={{ animationDelay: "240ms" }}>
          <EntryList
            title="Hoje"
            totalCents={todayTotal}
            entries={todayExpenses}
            onDelete={(id) => store.remove(id)}
          />
        </div>
      </div>

      {/* barra fixa de salvar */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6"
        style={{
          background: "linear-gradient(to top, var(--paper) 58%, transparent)",
        }}
      >
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className={[
            "pointer-events-auto flex w-full max-w-[428px] items-center justify-center gap-2",
            "rounded-2xl py-4 text-[16.5px] font-bold transition-all duration-200 active:scale-[0.98]",
            canSave
              ? "bg-accent text-white shadow-pop"
              : "cursor-default bg-line text-paper",
          ].join(" ")}
        >
          Salvar gasto
        </button>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-x-0 bottom-24 z-20 mx-auto flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-card"
          >
            <Check size={16} strokeWidth={3} className="text-[#7fe0b0]" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
