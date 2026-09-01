import { useState } from "react";
import { Pencil } from "lucide-react";
import { CATEGORY_ICON } from "../../shared/catalog";
import { formatBRL, formatCents } from "../../shared/format";
import type { CatAgg } from "../../model/analytics";
import type { Budget } from "../../model/types";

interface Props {
  items: CatAgg[];
  budgets: Budget[];
  onSetLimit: (category: string, limitCents: number) => void;
}

/** Teto (cinza, atrás) x real (colorido, na frente) por categoria. */
export default function BudgetBarList({ items, budgets, onSetLimit }: Props) {
  const [editing, setEditing] = useState(false);
  const limitByCategory = new Map(budgets.map((b) => [b.category, b.limitCents]));

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3.5">
        {items.map((it) => {
          const Icon = CATEGORY_ICON[it.category];
          const limit = limitByCategory.get(it.category) ?? 0;
          const pct = limit > 0 ? Math.min(100, (it.cents / limit) * 100) : 0;
          const over = limit > 0 && it.cents > limit;
          return (
            <li key={it.category}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="flex items-center gap-1.5 truncate text-[13.5px] font-medium text-ink">
                  {Icon ? <Icon size={14} strokeWidth={2} className="text-ink-soft" /> : null}
                  {it.category}
                </span>
                <span className="mono flex-none text-[12px] tabular text-ink-soft">
                  {formatBRL(it.cents)}
                  {limit > 0 && <span className="text-muted"> / {formatBRL(limit)}</span>}
                </span>
              </div>

              {limit > 0 ? (
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line/50">
                  <div
                    className={["h-full rounded-full transition-[width] duration-500", over ? "bg-warn" : "bg-data"].join(" ")}
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              ) : null}

              {editing && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="mono text-[11px] text-muted">teto R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    defaultValue={limit > 0 ? formatCents(limit) : ""}
                    placeholder="0,00"
                    onBlur={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      onSetLimit(it.category, digits ? parseInt(digits, 10) : 0);
                    }}
                    className="mono w-20 rounded-md border border-line bg-paper/50 px-1.5 py-0.5 text-[11px] tabular outline-none focus:border-accent"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        className="flex items-center gap-1.5 self-start text-[11.5px] font-semibold text-accent-ink"
      >
        <Pencil size={12} strokeWidth={2.2} />
        {editing ? "pronto" : "definir tetos"}
      </button>
    </div>
  );
}
