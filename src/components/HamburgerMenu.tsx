import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  CalendarDays,
  PieChart,
  Repeat,
  TrendingUp,
  Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type View =
  | "registrar"
  | "historico"
  | "resumo"
  | "fixos"
  | "entradas"
  | "investimentos"
  | "importar";

interface Item {
  id: View;
  label: string;
  icon: LucideIcon;
}

/** Registrar e Importar não entram aqui — moram na tela inicial (ver App.tsx). */
const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Consultar",
    items: [
      { id: "historico", label: "Histórico", icon: CalendarDays },
      { id: "resumo", label: "Resumo", icon: PieChart },
    ],
  },
  {
    title: "Dinheiro",
    items: [
      { id: "entradas", label: "Entradas", icon: TrendingUp },
      { id: "investimentos", label: "Investimentos", icon: Sprout },
      { id: "fixos", label: "Fixos", icon: Repeat },
    ],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: View;
  onChange: (v: View) => void;
}

/**
 * Menu hambúrguer: agrupa as abas secundárias. Registrar continua sendo a home.
 * O overlay usa um portal pra document.body — o header tem animação CSS em
 * transform (.rise), o que cria containing block pra position:fixed dentro
 * dele e quebraria o tamanho do painel se ele nascesse ali dentro.
 */
export default function HamburgerMenu({ open, onOpenChange, view, onChange }: Props) {
  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        aria-label="Abrir menu"
        className="grid h-9 w-9 flex-none place-items-center rounded-lg text-ink-soft transition-colors hover:text-accent-ink"
      >
        <Menu size={20} strokeWidth={2.2} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-40 bg-ink/35"
                onClick={() => onOpenChange(false)}
              />
              <motion.nav
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-y-0 right-0 z-50 flex w-[78%] max-w-[300px] flex-col
                           bg-surface p-5 shadow-card"
                aria-label="Menu"
              >
                <div className="mb-6 flex items-center justify-between">
                  <p className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
                    Menu
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    aria-label="Fechar menu"
                    className="rounded-lg p-1 text-muted hover:text-ink"
                  >
                    <X size={19} strokeWidth={2.2} />
                  </button>
                </div>

                <div className="flex flex-col gap-6 overflow-y-auto">
                  {GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                        {group.title}
                      </p>
                      <div className="flex flex-col gap-1">
                        {group.items.map(({ id, label, icon: Icon }) => {
                          const active = id === view;
                          return (
                            <button
                              key={id}
                              type="button"
                              aria-current={active ? "page" : undefined}
                              onClick={() => {
                                onChange(id);
                                onOpenChange(false);
                              }}
                              className={[
                                "flex items-center gap-3 rounded-card px-3 py-2.5 text-left text-[14.5px] font-medium transition-colors",
                                active
                                  ? "bg-accent-soft text-accent-ink"
                                  : "text-ink-soft hover:bg-paper",
                              ].join(" ")}
                            >
                              <Icon size={18} strokeWidth={active ? 2.3 : 2} />
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
