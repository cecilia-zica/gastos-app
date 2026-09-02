import { useState } from "react";
import { Plus, Trash2, Check, X, TrendingUp } from "lucide-react";
import AmountInput from "../components/AmountInput";
import { formatBRL, formatDayLabel, todayISO } from "../shared/format";
import type { Income, NewIncome } from "../model/types";
import tulip from "../assets/tulip.webp";

interface IForm {
  cents: number;
  description: string;
  date: string;
}

const emptyForm = (): IForm => ({ cents: 0, description: "", date: todayISO() });

interface Props {
  income: Income[];
  onAdd: (input: NewIncome) => void;
  onRemove: (id: string) => void;
}

/** Aba Entradas — renda registrada, mesma robustez dos gastos. */
export default function EntradasView({ income, onAdd, onRemove }: Props) {
  const [form, setForm] = useState<IForm | null>(null);
  const set = <K extends keyof IForm>(k: K, v: IForm[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const total = income.reduce((s, it) => s + it.amountCents, 0);

  function save() {
    if (!form || form.cents <= 0) return;
    onAdd({
      amountCents: form.cents,
      description: form.description.trim(),
      date: form.date,
    });
    setForm(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rise flex items-end justify-between px-1" style={{ animationDelay: "40ms" }}>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Entradas</h2>
          <p className="mt-0.5 text-[13.5px] text-muted">o que entrou</p>
        </div>
        <span className="mono text-[15px] tabular text-ink-soft">{formatBRL(total)}</span>
      </div>

      {form ? (
        <section className="rise relative rounded-card border border-line bg-surface p-4 shadow-card">
          <img
            src={tulip}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 right-4 h-[76px] w-auto rotate-[-8deg] drop-shadow-[0_10px_14px_rgba(36,55,31,.28)]"
          />
          <p className="mb-2 ml-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Nova entrada
          </p>
          <AmountInput cents={form.cents} onChange={(c) => set("cents", c)} />
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="De onde veio (ex: salário, pix da vó)"
            className="mt-2 w-full rounded-card border border-line bg-paper/40 px-4 py-3 text-base text-ink outline-none focus:border-accent"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="mt-2 w-full rounded-card border border-line bg-paper/40 px-4 py-3 text-base text-ink outline-none focus:border-accent"
          />
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={form.cents <= 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-card bg-accent py-3 font-bold text-surface shadow-pop transition-all active:scale-[0.98] disabled:bg-line disabled:text-paper disabled:shadow-none"
            >
              <Check size={17} strokeWidth={2.5} /> Salvar
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="flex items-center justify-center gap-1.5 rounded-card border border-line bg-surface px-4 font-semibold text-muted"
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setForm(emptyForm())}
          className="rise flex items-center justify-center gap-2 rounded-card border border-dashed border-accent/50 bg-accent-soft/40 py-3.5 font-semibold text-accent-ink transition-colors hover:bg-accent-soft"
          style={{ animationDelay: "80ms" }}
        >
          <Plus size={18} strokeWidth={2.4} /> Nova entrada
        </button>
      )}

      {income.length === 0 && !form ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-10 text-center text-sm text-muted">
          <TrendingUp className="mx-auto mb-2 opacity-40" size={28} strokeWidth={1.6} />
          Nenhuma entrada ainda.
          <br />
          Registre salário, pix, reembolsos…
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {income.map((it) => (
            <li
              key={it.id}
              className="flex items-center gap-3 rounded-card border border-line bg-surface px-3.5 py-3 shadow-card"
            >
              <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-data-soft text-data">
                <TrendingUp size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{it.description || "Entrada"}</p>
                <p className="mt-0.5 text-[12.5px] text-muted">{formatDayLabel(it.date)}</p>
              </div>
              <span className="mono text-[15px] tabular">{formatBRL(it.amountCents)}</span>
              <button
                type="button"
                aria-label="Remover"
                onClick={() => onRemove(it.id)}
                className="ml-0.5 flex-none rounded-lg p-1.5 text-line transition-colors hover:text-accent"
              >
                <Trash2 size={17} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
