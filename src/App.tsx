import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, NotebookPen } from "lucide-react";
import RegistrarView from "./views/RegistrarView";
import HistoricoView from "./views/HistoricoView";
import TabBar, { type View } from "./components/TabBar";
import { type Draft } from "./components/QuickAdd";
import { store } from "./lib/store";
import { DEFAULT_CATEGORY, DEFAULT_PAYMENT } from "./lib/config";
import { todayISO } from "./lib/format";
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
  const [view, setView] = useState<View>("registrar");

  useEffect(() => store.subscribe(setExpenses), []);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const today = todayISO();
  const todayExpenses = useMemo(
    () => expenses.filter((e) => e.date === today),
    [expenses, today],
  );
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
    setDraft((d) => ({ ...d, cents: 0, description: "" }));
    showToast("Anotado");
  }

  const canSave = draft.cents > 0;

  return (
    <div className="mx-auto min-h-screen max-w-[460px] px-4 pb-44 pt-6">
      <header className="rise mb-5 flex items-center gap-2.5 px-1">
        <div className="stamp grid h-9 w-9 place-items-center rounded-xl bg-accent text-white shadow-pop">
          <NotebookPen size={18} strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <h1 className="font-display text-lg font-bold tracking-tight">Miúdos</h1>
          <p className="text-xs font-medium text-muted">seus gastos, sem susto</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {view === "registrar" ? (
            <RegistrarView
              draft={draft}
              set={set}
              todayExpenses={todayExpenses}
              todayTotal={todayTotal}
              onDelete={(id) => store.remove(id)}
            />
          ) : (
            <HistoricoView expenses={expenses} />
          )}
        </motion.main>
      </AnimatePresence>

      {/* area inferior fixa: botao salvar (so no registrar) + navegacao */}
      <div className="fixed inset-x-0 bottom-0 z-30">
        <AnimatePresence>
          {view === "registrar" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-none flex justify-center px-4 pb-3 pt-8"
              style={{ background: "linear-gradient(to top, var(--paper) 55%, transparent)" }}
            >
              <button
                type="button"
                onClick={save}
                disabled={!canSave}
                className={[
                  "pointer-events-auto flex w-full max-w-[428px] items-center justify-center",
                  "rounded-2xl py-4 text-[16.5px] font-bold transition-all duration-200 active:scale-[0.98]",
                  canSave
                    ? "bg-accent text-white shadow-pop"
                    : "cursor-default bg-line text-paper",
                ].join(" ")}
              >
                Salvar gasto
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <TabBar view={view} onChange={setView} />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-x-0 bottom-28 z-40 mx-auto flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-card"
          >
            <Check size={16} strokeWidth={3} className="text-[#7fe0b0]" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
