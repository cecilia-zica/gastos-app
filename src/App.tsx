import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LogOut } from "lucide-react";
import logoWert from "./assets/logo-wert.webp";
import RegistrarView from "./views/RegistrarView";
import HistoricoView from "./views/HistoricoView";
import DashboardView from "./views/DashboardView";
import FixosView from "./views/FixosView";
import EntrarView from "./views/EntrarView";
import TabBar, { type View } from "./components/TabBar";
import { useExpenses } from "./controllers/useExpenses";
import { useDraft } from "./controllers/useDraft";
import { useRecurring } from "./controllers/useRecurring";
import { useAuth } from "./controllers/useAuth";
import { todayISO } from "./shared/format";
import { firebaseEnabled } from "./model/firebase";
import { store } from "./model/store";
import { recurringStore } from "./model/recurringStore";
import { FirebaseExpenseStore } from "./model/firebaseExpenseStore";
import { FirebaseRecurringStore } from "./model/firebaseRecurringStore";
import { migrateLocalToCloud } from "./model/migrate";

/**
 * Raiz (MVC): liga os controllers (useExpenses, useDraft) às views.
 * Não contém regra de domínio — só orquestra estado de tela, auth e toasts.
 */
export default function App() {
  const auth = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [cloudReady, setCloudReady] = useState(!firebaseEnabled);

  // Login com Google feito: troca o backend do store pra Firestore (namespaced
  // por uid) e sobe uma unica vez o que ja existia local. Logout: volta pro local.
  useEffect(() => {
    if (!firebaseEnabled) return;
    if (!auth.user) {
      setCloudReady(false);
      return;
    }
    const cloudExpenses = new FirebaseExpenseStore(auth.user.uid);
    const cloudRecurring = new FirebaseRecurringStore(auth.user.uid);
    store.setBackend(cloudExpenses);
    recurringStore.setBackend(cloudRecurring);
    setCloudReady(false);
    void migrateLocalToCloud(cloudExpenses, cloudRecurring, auth.user.uid).then(() =>
      setCloudReady(true),
    );
  }, [auth.user]);

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

  async function handleSignIn() {
    setAuthError(null);
    try {
      await auth.signIn();
    } catch {
      setAuthError("Não deu pra entrar. Tenta de novo.");
    }
  }

  if (firebaseEnabled && (auth.loading || (auth.user && !cloudReady))) {
    return (
      <div className="grid min-h-screen place-items-center text-[14px] text-muted">
        carregando...
      </div>
    );
  }

  if (firebaseEnabled && !auth.user) {
    return <EntrarView onSignIn={handleSignIn} error={authError} />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-[460px] px-4 pb-44 pt-6">
      <header className="rise mb-5 flex items-center gap-2.5 px-1">
        <button
          type="button"
          onClick={() => setView("registrar")}
          aria-label="Ir para Registrar"
          className="stamp -my-1 flex flex-col items-start"
        >
          <img src={logoWert} alt="wert" className="h-10 w-auto" />
          <p className="-mt-1 ml-0.5 text-xs font-medium text-muted">seus gastos, sem susto</p>
        </button>
        {auth.user && (
          <button
            type="button"
            onClick={() => void auth.signOut()}
            aria-label="Sair"
            className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:text-ink-soft"
          >
            <LogOut size={17} strokeWidth={2.2} />
          </button>
        )}
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
                    ? "bg-accent text-surface shadow-pop"
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
