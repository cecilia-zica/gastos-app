import specimenPink from "../assets/specimen-pink.webp";
import AmountInput from "./AmountInput";
import CategoryChips from "./CategoryChips";
import PaymentChips from "./PaymentChips";
import type { Draft } from "../controllers/useDraft";

interface Props {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  /** Numero de acessao mostrado no canto da ficha (so decorativo). */
  nextNumber: number;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 ml-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
      {children}
    </p>
  );
}

/** O cartao de captura rapida — o coracao do app, estilo "ficha de espécime". */
export default function QuickAdd({ draft, set, nextNumber }: Props) {
  return (
    <section
      className="rise relative rounded-card border border-line bg-surface p-4 shadow-card"
      style={{ animationDelay: "160ms" }}
    >
      <img
        src={specimenPink}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-9 right-1.5 w-[124px] rotate-[11deg] drop-shadow-[0_10px_14px_rgba(36,55,31,.28)]"
      />
      <div className="mb-1 flex items-baseline justify-between">
        <Label>Novo espécime</Label>
        <span className="mono text-[10.5px] text-muted">
          nº {String(nextNumber).padStart(3, "0")}
        </span>
      </div>

      <AmountInput cents={draft.cents} onChange={(c) => set("cents", c)} />

      <div className="my-4 h-px bg-line" />

      <input
        value={draft.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="No que foi? (ex: mercado da semana)"
        aria-label="Descrição"
        className="w-full rounded-card border border-line bg-paper/40 px-4 py-3 text-base
                   text-ink outline-none transition-colors placeholder:text-muted/70
                   focus:border-accent"
      />

      <div className="mt-3">
        <Label>Data</Label>
        <input
          type="date"
          value={draft.date}
          onChange={(e) => set("date", e.target.value)}
          aria-label="Data"
          className="w-full rounded-card border border-line bg-paper/40 px-4 py-3 text-base
                     text-ink outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="mt-4">
        <Label>Categoria</Label>
        <CategoryChips value={draft.category} onChange={(c) => set("category", c)} />
      </div>

      <div className="mt-3">
        <Label>Forma de pagamento</Label>
        <PaymentChips value={draft.payment} onChange={(p) => set("payment", p)} />
      </div>
    </section>
  );
}
