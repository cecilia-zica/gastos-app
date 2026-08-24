import QuickAdd, { type Draft } from "../components/QuickAdd";
import EntryList from "../components/EntryList";
import { greeting } from "../lib/format";
import type { Expense } from "../types";

interface Props {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  todayExpenses: Expense[];
  todayTotal: number;
  onDelete: (id: string) => void;
}

/** Aba Registrar — singela: uma saudacao tenra e o que importa, anotar. */
export default function RegistrarView({
  draft,
  set,
  todayExpenses,
  todayTotal,
  onDelete,
}: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rise px-1" style={{ animationDelay: "40ms" }}>
        <p className="font-display text-2xl font-bold leading-tight tracking-tight">
          {greeting()}
          <span className="text-accent">.</span>
        </p>
        <p className="mt-0.5 text-[13.5px] text-muted">o que você gastou?</p>
      </div>

      <div className="rise" style={{ animationDelay: "120ms" }}>
        <QuickAdd draft={draft} set={set} />
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
