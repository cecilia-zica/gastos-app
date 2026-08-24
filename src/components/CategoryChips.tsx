import { CATEGORIES } from "../lib/config";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

/** Chips de categoria em rolagem horizontal. Icone Lucide + rotulo. */
export default function CategoryChips({ value, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Categoria"
      className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
    >
      {CATEGORIES.map(({ id, icon: Icon }) => {
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={[
              "flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full",
              "border px-3.5 py-2 text-sm font-medium transition-all duration-150",
              active
                ? "border-accent bg-accent text-white shadow-pop"
                : "border-line bg-surface text-ink hover:border-ink/30",
            ].join(" ")}
          >
            <Icon size={15} strokeWidth={2.2} />
            {id}
          </button>
        );
      })}
    </div>
  );
}
