import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CATEGORY_ICON } from "../lib/config";
import { formatBRL } from "../lib/format";
import type { Expense } from "../types";

interface Props {
  label: string;
  entries: Expense[];
  defaultOpen?: boolean;
}

interface CatSlice {
  category: string;
  cents: number;
  count: number;
}

/**
 * Cartao de um mes no historico. Fechado mostra so o essencial;
 * aberto revela onde o dinheiro foi, por categoria, com barrinhas.
 */
export default function MonthCard({ label, entries, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const total = entries.reduce((s, e) => s + e.amountCents, 0);

  const slices = useMemo<CatSlice[]>(() => {
    const map = new Map<string, CatSlice>();
    for (const e of entries) {
      const cur = map.get(e.category) ?? { category: e.category, cents: 0, count: 0 };
      cur.cents += e.amountCents;
      cur.count += 1;
      map.set(e.category, cur);
    }
    return [...map.values()].sort((a, b) => b.cents - a.cents);
  }, [entries]);

  const max = slices[0]?.cents ?? 1;

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="font-display text-[17px] font-bold leading-tight">{label}</p>
          <p className="mt-0.5 text-[12.5px] text-muted">
            {entries.length} lançamento{entries.length === 1 ? "" : "s"}
          </p>
        </div>
        <span className="mono text-[17px] font-normal tabular text-ink">
          {formatBRL(total)}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={2.2}
          className={[
            "flex-none text-muted transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2.5 border-t border-line px-5 pb-5 pt-4">
              {slices.map(({ category, cents, count }) => {
                const Icon = CATEGORY_ICON[category];
                return (
                  <div key={category} className="flex items-center gap-3">
                    <div className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-paper text-ink-soft">
                      {Icon ? <Icon size={15} strokeWidth={2} /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[13.5px] font-medium">{category}</span>
                        <span className="mono text-[13px] tabular text-ink-soft">
                          {formatBRL(cents)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper">
                        <div
                          className="h-full rounded-full bg-accent/70"
                          style={{ width: `${Math.max(6, (cents / max) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-6 flex-none text-right text-[11px] tabular text-muted">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
