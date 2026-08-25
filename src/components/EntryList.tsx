import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Receipt } from "lucide-react";
import { CATEGORY_ICON } from "../shared/catalog";
import { formatBRL } from "../shared/format";
import type { Expense } from "../model/types";

interface Props {
  title: string;
  totalCents: number;
  entries: Expense[];
  onDelete: (id: string) => void;
}

/** Lista dos gastos (por padrao, os de hoje). */
export default function EntryList({ title, totalCents, entries, onDelete }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="text-[15px] font-bold">{title}</h2>
        <span className="mono text-sm tabular text-muted">{formatBRL(totalCents)}</span>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-9 text-center text-sm text-muted">
          <Receipt className="mx-auto mb-2 opacity-40" size={30} strokeWidth={1.6} />
          Nenhum gasto ainda.
          <br />
          Anota ali em cima quando gastar algo.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {entries.map((e) => {
              const Icon = CATEGORY_ICON[e.category] ?? Receipt;
              return (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 shadow-card"
                >
                  <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-paper text-ink-soft">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">
                      {e.description || e.category}
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-muted">
                      <span className="font-semibold text-ink-soft">{e.payment}</span>
                      {" · "}
                      {e.category}
                    </p>
                  </div>
                  <span className="mono text-[15px] font-normal tabular">
                    {formatBRL(e.amountCents)}
                  </span>
                  <button
                    type="button"
                    aria-label="Excluir gasto"
                    onClick={() => onDelete(e.id)}
                    className="ml-0.5 flex-none rounded-lg p-1.5 text-line transition-colors hover:text-accent"
                  >
                    <Trash2 size={17} strokeWidth={2} />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
