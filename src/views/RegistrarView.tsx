import { Upload } from "lucide-react";
import QuickAdd from "../components/QuickAdd";
import EntryList from "../components/EntryList";
import { greeting } from "../shared/format";
import type { Expense } from "../model/types";
import type { Draft } from "../controllers/useDraft";

interface Props {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  todayExpenses: Expense[];
  todayTotal: number;
  onDelete: (id: string) => void;
  onImport: () => void;
}

/** Aba Registrar — singela: uma saudacao tenra e o que importa, anotar. */
export default function RegistrarView({
  draft,
  set,
  todayExpenses,
  todayTotal,
  onDelete,
  onImport,
}: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rise flex items-start justify-between gap-3 px-1" style={{ animationDelay: "40ms" }}>
        <div>
          <p className="font-display text-2xl font-bold leading-tight tracking-tight">
            {greeting()}
            <span className="text-accent">.</span>
          </p>
          <p className="mt-0.5 text-[13.5px] text-muted">o que você gastou?</p>
        </div>
        <button
          type="button"
          onClick={onImport}
          className="mt-1 flex flex-none items-center gap-1.5 rounded-card border border-line
                     bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft
                     transition-colors hover:border-accent/50 hover:text-accent-ink"
        >
          <Upload size={14} strokeWidth={2.2} />
          Importar extrato
        </button>
      </div>

      <div className="rise" style={{ animationDelay: "120ms" }}>
        <QuickAdd draft={draft} set={set} nextNumber={todayExpenses.length + 1} />
      </div>

      <div className="rise" style={{ animationDelay: "200ms" }}>
        <EntryList
          title="Hoje"
          totalCents={todayTotal}
          entries={todayExpenses}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
