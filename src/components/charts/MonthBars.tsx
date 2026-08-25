import type { MonthAgg } from "../../model/analytics";

interface Props {
  months: MonthAgg[];
  formatValue: (cents: number) => string;
}

/**
 * Saídas ao longo dos meses — barras verticais, 1 série (sem legenda).
 * Rótulo direto só no mês de maior gasto (seletivo, dataviz); os demais
 * mostram o valor no hover (title nativo).
 */
export default function MonthBars({ months, formatValue }: Props) {
  const max = Math.max(1, ...months.map((m) => m.cents));
  const maxKey = months.reduce(
    (best, m) => (m.cents > (best?.cents ?? -1) ? m : best),
    undefined as MonthAgg | undefined,
  )?.key;

  return (
    <div className="flex h-[150px] items-end gap-2">
      {months.map((m) => {
        const h = Math.max(3, (m.cents / max) * 100);
        const isMax = m.key === maxKey;
        return (
          <div
            key={m.key}
            className="flex flex-1 flex-col items-center justify-end gap-1.5"
            title={`${m.label}: ${formatValue(m.cents)}`}
          >
            {isMax ? (
              <span className="mono text-[10px] tabular text-ink-soft">
                {formatValue(m.cents)}
              </span>
            ) : null}
            <div
              className={[
                "w-full rounded-t-md transition-[height] duration-500",
                isMax ? "bg-accent" : "bg-data",
              ].join(" ")}
              style={{ height: `${h}%` }}
            />
            <span className="text-[11px] font-medium capitalize text-muted">
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
