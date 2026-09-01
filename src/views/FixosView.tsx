import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, Repeat } from "lucide-react";
import AmountInput from "../components/AmountInput";
import CategoryChips from "../components/CategoryChips";
import PaymentChips from "../components/PaymentChips";
import { CATEGORY_ICON, DEFAULT_CATEGORY, DEFAULT_PAYMENT } from "../shared/catalog";
import { formatBRL, monthKey, todayISO } from "../shared/format";
import type { NewRecurring, Payment, Recurring } from "../model/types";

interface FForm {
  id?: string;
  cents: number;
  description: string;
  category: string;
  payment: Payment;
  day: number;
}

const emptyForm = (): FForm => ({
  cents: 0,
  description: "",
  category: DEFAULT_CATEGORY,
  payment: DEFAULT_PAYMENT,
  day: 1,
});

interface Props {
  recurrings: Recurring[];
  onAdd: (input: NewRecurring) => void;
  onEdit: (id: string, patch: Partial<NewRecurring>) => void;
  onRemove: (id: string) => void;
}

/** Aba Fixos — gastos que se repetem todo mês. Editar muda daqui pra frente. */
export default function FixosView({ recurrings, onAdd, onEdit, onRemove }: Props) {
  const current = monthKey(todayISO());
  const active = recurrings.filter((r) => r.until === null || r.until >= current);
  const totalMonth = active.reduce((s, r) => s + r.amountCents, 0);

  const [form, setForm] = useState<FForm | null>(null);
  const set = <K extends keyof FForm>(k: K, v: FForm[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  function startNew() { setForm(emptyForm()); }
  function startEdit(r: Recurring) {
    setForm({ id: r.id, cents: r.amountCents, description: r.description, category: r.category, payment: r.payment, day: r.dayOfMonth });
  }

  function save() {
    if (!form || form.cents <= 0) return;
    if (form.id) {
      onEdit(form.id, {
        amountCents: form.cents,
        description: form.description.trim(),
        category: form.category,
        payment: form.payment,
        dayOfMonth: form.day,
      });
    } else {
      onAdd({
        description: form.description.trim(),
        amountCents: form.cents,
        category: form.category,
        payment: form.payment,
        dayOfMonth: form.day,
        since: current,
        until: null,
      });
    }
    setForm(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rise flex items-end justify-between px-1" style={{ animationDelay: "40ms" }}>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Fixos</h2>
          <p className="mt-0.5 text-[13.5px] text-muted">se repetem todo mês, automático</p>
        </div>
        <span className="mono text-[15px] tabular text-ink-soft">{formatBRL(totalMonth)}/mês</span>
      </div>

      {form ? (
        <section className="rise rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="mb-2 ml-0.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
            {form.id ? "Editar fixo" : "Novo fixo"}
          </p>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="mono text-xl text-muted">R$</span>
            <AmountInput cents={form.cents} onChange={(c) => set("cents", c)} />
          </div>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Nome (ex: Aluguel, Netflix, Psi)"
            className="mt-2 w-full rounded-2xl border border-line bg-paper/40 px-4 py-3 text-base text-ink outline-none focus:border-accent"
          />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Todo dia</span>
            <input
              type="number"
              min={1}
              max={28}
              value={form.day}
              onChange={(e) => set("day", Math.min(28, Math.max(1, Number(e.target.value) || 1)))}
              className="mono w-16 rounded-xl border border-line bg-paper/40 px-3 py-2 text-center text-ink outline-none focus:border-accent"
            />
          </div>
          <p className="mb-2 mt-4 ml-0.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Categoria</p>
          <CategoryChips value={form.category} onChange={(c) => set("category", c)} />
          <p className="mb-2 mt-3 ml-0.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Pagamento</p>
          <PaymentChips value={form.payment} onChange={(p) => set("payment", p)} />
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={form.cents <= 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent py-3 font-bold text-surface shadow-pop transition-all active:scale-[0.98] disabled:bg-line disabled:text-paper disabled:shadow-none"
            >
              <Check size={17} strokeWidth={2.5} /> Salvar
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-line bg-surface px-4 font-semibold text-muted"
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={startNew}
          className="rise flex items-center justify-center gap-2 rounded-2xl border border-dashed border-accent/50 bg-accent-soft/40 py-3.5 font-semibold text-accent-ink transition-colors hover:bg-accent-soft"
          style={{ animationDelay: "80ms" }}
        >
          <Plus size={18} strokeWidth={2.4} /> Novo fixo
        </button>
      )}

      {active.length === 0 && !form ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-10 text-center text-sm text-muted">
          <Repeat className="mx-auto mb-2 opacity-40" size={28} strokeWidth={1.6} />
          Nenhum fixo ainda.
          <br />
          Cadastre aluguel, assinaturas, academia…
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {active.map((r) => {
            const Icon = CATEGORY_ICON[r.category] ?? Repeat;
            return (
              <li key={r.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 shadow-card">
                <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-paper text-ink-soft">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">{r.description || r.category}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    <span className="font-semibold text-ink-soft">{r.payment}</span> · dia {r.dayOfMonth}
                  </p>
                </div>
                <span className="mono text-[15px] tabular">{formatBRL(r.amountCents)}</span>
                <button type="button" aria-label="Editar" onClick={() => startEdit(r)} className="rounded-lg p-1.5 text-muted transition-colors hover:text-accent">
                  <Pencil size={16} strokeWidth={2} />
                </button>
                <button type="button" aria-label="Remover" onClick={() => onRemove(r.id)} className="rounded-lg p-1.5 text-line transition-colors hover:text-accent">
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
