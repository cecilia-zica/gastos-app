import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, NotebookPen } from "lucide-react";
import RegistrarView from "./views/RegistrarView";
import HistoricoView from "./views/HistoricoView";
import DashboardView from "./views/DashboardView";
import FixosView from "./views/FixosView";
import TabBar, { type View } from "./components/TabBar";
import { useExpenses } from "./controllers/useExpenses";
import { useDraft } from "./controllers/useDraft";
import { useRecurring } from "./controllers/useRecurring";
import { todayISO } from "./shared/format";

/**
 * Raiz (MVC): liga os controllers (useExpenses, useDraft) às views.
 * Não contém regra de domínio — só orquestra estado de tela e toasts.
 */
export default function App() {
  const { expenses, add, remove } = useExpenses();
  const recurring = useRecurring(expenses);
  const { draft, set, canSave, save } = useDraft(add);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<View>("registrar");

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

  async function handleSave() {
    if (await save()) showToast("Anotado");
  }

  return (
    <div className="mx-auto min-h-screen max-w-[460px] px-4 pb-44 pt-6">
      <header className="rise mb-5 flex items-center gap-2.5 px-1">
        <div className="stamp grid h-9 w-9 place-items-center rounded-xl bg-accent text-ink shadow-pop">
          <NotebookPen size={18} strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <h1 className="font-display text-lg font-bold tracking-tight">wert</h1>
          <p className="text-xs font-medium text-muted">seus gastos, sem susto</p>
        </div>
      </header>

      {/* troca de view por remontagem + fade CSS (key={view}); simples e à
          prova de travas de AnimatePresence. */}
      <main key={view} className="rise">
        {view === "registrar" ? (
          <RegistrarView
            draft={draft}
            set={set}
            todayExpenses={todayExpenses}
            todayTotal={todayTotal}
            onDelete={(id) => remove(id)}
          />
        ) : view === "historico" ? (
          <HistoricoView expenses={expenses} onDelete={(id) => remove(id)} />
        ) : view === "resumo" ? (
          <DashboardView expenses={expenses} />
        ) : (
          <FixosView
            recurrings={recurring.recurrings}
            onAdd={recurring.add}
            onEdit={recurring.edit}
            onRemove={recurring.remove}
          />
        )}
      </main>

      {/* área inferior fixa: botão salvar (só no registrar) + navegação */}
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
                onClick={handleSave}
                disabled={!canSave}
                className={[
                  "pointer-events-auto flex w-full max-w-[428px] items-center justify-center",
                  "rounded-2xl py-4 text-[16.5px] font-bold transition-all duration-200 active:scale-[0.98]",
                  canSave
                    ? "bg-accent text-ink shadow-pop"
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
            <Check size={16} strokeWidth={3} className="text-straw" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
