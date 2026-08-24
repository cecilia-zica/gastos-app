import { NotebookPen, CalendarDays } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type View = "registrar" | "historico";

const TABS: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "registrar", label: "Registrar", icon: NotebookPen },
  { id: "historico", label: "Histórico", icon: CalendarDays },
];

interface Props {
  view: View;
  onChange: (v: View) => void;
}

/** Navegacao inferior — duas telas: registrar e historico. */
export default function TabBar({ view, onChange }: Props) {
  return (
    <nav
      className="border-t border-line bg-surface/85 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-[460px]">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onChange(id)}
              className={[
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11.5px] font-semibold",
                "transition-colors duration-150",
                active ? "text-accent" : "text-muted hover:text-ink-soft",
              ].join(" ")}
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 2} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
