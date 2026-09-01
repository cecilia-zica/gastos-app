import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import BarList, { type BarItem } from "../components/charts/BarList";
import EntryList from "../components/EntryList";
import { CATEGORY_ICON } from "../shared/catalog";
import { monthKey, monthYearLabel, formatBRL, todayISO } from "../shared/format";
import { topCategories, sumCents } from "../model/analytics";
import type { Expense } from "../model/types";

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

/** Aba Histórico — escolha o mês e veja o que rolou nele. */
export default function HistoricoView({ expenses, onDelete }: Props) {
  const months = useMemo(() => {
    const set = new Set(expenses.map((e) => monthKey(e.date)));
    return [...set].sort((a, b) => (a < b ? 1 : -1));
  }, [expenses]);

  const [sel, setSel] = useState<string | null>(null);
  // abre no mês atual se houver dados; senão, no mês mais recente
  const current = monthKey(todayISO());
  const fallback = months.includes(current) ? current : months[0];
  const active = sel && months.includes(sel) ? sel : fallback;

  const monthEntries = useMemo(
    () => (active ? expenses.filter((e) => monthKey(e.date) === active) : []),
    [expenses, active],
  );
  const total = sumCents(monthEntries);
  const catItems: BarItem[] = topCategories(monthEntries).map((c) => {
    const Icon = CATEGORY_ICON[c.category];
    return {
      key: c.category,
      label: c.category,
      cents: c.cents,
      icon: Icon ? <Icon size={15} strokeWidth={2} /> : undefined,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="rise px-1" style={{ animationDelay: "40ms" }}>
        <h2 className="font-display text-2xl font-bold tracking-tight">Histórico</h2>
        <p className="mt-0.5 text-[13.5px] text-muted">escolha o mês</p>
      </div>

      {months.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-12 text-center text-sm text-muted">
          <CalendarDays className="mx-auto mb-2 opacity-40" size={30} strokeWidth={1.6} />
          Ainda não há meses pra mostrar.
          <br />
          Vá registrando e eles aparecem aqui.
        </div>
      ) : (
        <>
          {/* seletor de mês */}
          <div
            role="group"
            aria-label="Mês"
            className="no-scrollbar rise -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            style={{ animationDelay: "80ms" }}
          >
            {months.map((key) => {
              const on = key === active;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSel(key)}
                  className={[
                    "flex-none whitespace-nowrap rounded-card border px-4 py-2 text-[13.5px] font-semibold transition-all",
                    on
                      ? "border-accent bg-accent text-surface shadow-pop"
                      : "border-line bg-surface text-ink hover:border-ink/30",
                  ].join(" ")}
                >
                  {monthYearLabel(key)}
                </button>
              );
            })}
          </div>

          <div
            className="rise flex items-baseline justify-between rounded-card border border-line bg-surface px-5 py-4 shadow-card"
            style={{ animationDelay: "120ms" }}
          >
            <div>
              <p className="font-display text-[17px] font-bold">
                {active ? monthYearLabel(active) : ""}
              </p>
              <p className="mt-0.5 text-[12.5px] text-muted">
                {monthEntries.length} lançamento{monthEntries.length === 1 ? "" : "s"}
              </p>
            </div>
            <span className="mono text-[19px] tabular text-ink">{formatBRL(total)}</span>
          </div>

          <section
            className="rise rounded-card border border-line bg-surface p-4 shadow-card"
            style={{ animationDelay: "180ms" }}
          >
            <h3 className="mb-3.5 font-display text-[15px] font-bold">Onde foi</h3>
            <BarList items={catItems} formatValue={formatBRL} />
          </section>

          <div className="rise" style={{ animationDelay: "240ms" }}>
            <EntryList
              title="Lançamentos"
              totalCents={total}
              entries={monthEntries}
              onDelete={onDelete}
            />
          </div>
        </>
      )}
    </div>
  );
}
