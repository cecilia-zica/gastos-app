import type { ReactNode } from "react";

export interface BarItem {
  key: string;
  label: string;
  cents: number;
  icon?: ReactNode;
}

interface Props {
  items: BarItem[];
  formatValue: (cents: number) => string;
}

/**
 * Ranking de magnitude: barras horizontais de UM hue (marrom-sienna).
 * A identidade vem do rótulo, não da cor (dataviz). Valor sempre visível
 * — é o alívio de contraste exigido pela paleta.
 */
export default function BarList({ items, formatValue }: Props) {
  const max = Math.max(1, ...items.map((i) => i.cents));

  return (
    <ul className="flex flex-col gap-3">
      {items.map((it) => {
        const pct = Math.max(4, (it.cents / max) * 100);
        return (
          <li key={it.key} className="flex items-center gap-3">
            {it.icon ? (
              <div className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-paper text-ink-soft">
                {it.icon}
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[13.5px] font-medium text-ink">
                  {it.label}
                </span>
                <span className="mono text-[13px] tabular text-ink-soft">
                  {formatValue(it.cents)}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-data-soft/60">
                <div
                  className="h-full rounded-full bg-data transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
