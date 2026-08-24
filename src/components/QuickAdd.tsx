import AmountInput from "./AmountInput";
import CategoryChips from "./CategoryChips";
import PaymentChips from "./PaymentChips";
import type { Payment } from "../types";

export interface Draft {
  cents: number;
  description: string;
  date: string;
  category: string;
  payment: Payment;
}

interface Props {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 ml-0.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
      {children}
    </p>
  );
}

/** O cartao de captura rapida — o coracao do app. */
export default function QuickAdd({ draft, set }: Props) {
  return (
    <section
      className="rise rounded-card border border-line bg-surface p-4 shadow-card"
      style={{ animationDelay: "160ms" }}
    >
      <Label>Quanto foi?</Label>
      <AmountInput cents={draft.cents} onChange={(c) => set("cents", c)} />

      <div className="my-4 h-px bg-line" />

      <input
        value={draft.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="No que foi? (ex: mercado da semana)"
        aria-label="Descrição"
        className="w-full rounded-2xl border border-line bg-paper/40 px-4 py-3 text-base
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
          className="w-full rounded-2xl border border-line bg-paper/40 px-4 py-3 text-base
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
