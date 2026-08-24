import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import MonthCard from "../components/MonthCard";
import { monthKey, monthYearLabel, todayISO } from "../lib/format";
import type { Expense } from "../types";

interface Props {
  expenses: Expense[];
}

/** Aba Histórico — os meses, do mais recente ao mais antigo. */
export default function HistoricoView({ expenses }: Props) {
  const months = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of expenses) {
      const k = monthKey(e.date);
      (map.get(k) ?? map.set(k, []).get(k)!).push(e);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [expenses]);

  const current = monthKey(todayISO());

  return (
    <div className="flex flex-col gap-4">
      <div className="rise px-1">
        <h2 className="font-display text-2xl font-bold tracking-tight">Histórico</h2>
        <p className="mt-0.5 text-[13.5px] text-muted">seus meses, no seu tempo</p>
      </div>

      {months.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-12 text-center text-sm text-muted">
          <CalendarDays className="mx-auto mb-2 opacity-40" size={30} strokeWidth={1.6} />
          Ainda não há meses pra mostrar.
          <br />
          Vá registrando e eles aparecem aqui.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {months.map(([key, list], i) => (
            <div
              key={key}
              className="rise"
              style={{ animationDelay: `${80 + i * 70}ms` }}
            >
              <MonthCard
                label={monthYearLabel(key)}
                entries={list}
                defaultOpen={key === current}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
