import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, Sprout } from "lucide-react";
import AmountInput from "../components/AmountInput";
import { formatBRL } from "../shared/format";
import type { Investment, NewInvestment } from "../model/types";
import leaf from "../assets/leaf.webp";

interface IForm {
  id?: string;
  name: string;
  investedCents: number;
  goalCents: number;
}

const emptyForm = (): IForm => ({ name: "", investedCents: 0, goalCents: 0 });

interface Props {
  investments: Investment[];
  onAdd: (input: NewInvestment) => void;
  onEdit: (id: string, patch: Partial<NewInvestment>) => void;
  onRemove: (id: string) => void;
}

/** Aba Investimentos — posicoes (o que + quanto investiu vs meta), nao um ledger. */
export default function InvestimentosView({ investments, onAdd, onEdit, onRemove }: Props) {
  const [form, setForm] = useState<IForm | null>(null);
  const set = <K extends keyof IForm>(k: K, v: IForm[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const totalInvested = investments.reduce((s, i) => s + i.investedCents, 0);
  const totalGoal = investments.reduce((s, i) => s + i.goalCents, 0);

  function startEdit(inv: Investment) {
    setForm({ id: inv.id, name: inv.name, investedCents: inv.investedCents, goalCents: inv.goalCents });
  }

  function save() {
    if (!form || !form.name.trim()) return;
    if (form.id) {
      onEdit(form.id, {
        name: form.name.trim(),
        investedCents: form.investedCents,
        goalCents: form.goalCents,
      });
    } else {
      onAdd({ name: form.name.trim(), investedCents: form.investedCents, goalCents: form.goalCents });
    }
    setForm(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rise flex items-end justify-between px-1" style={{ animationDelay: "40ms" }}>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Investimentos</h2>
          <p className="mt-0.5 text-[13.5px] text-muted">o que já rendeu raiz</p>
        </div>
        <span className="mono text-[15px] tabular text-ink-soft">
          {formatBRL(totalInvested)}
          {totalGoal > 0 ? ` / ${formatBRL(totalGoal)}` : ""}
        </span>
      </div>

      {form ? (
        <section className="rise relative rounded-card border border-line bg-surface p-4 shadow-card">
          <img
            src={leaf}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 right-3 h-[68px] w-auto rotate-[14deg] drop-shadow-[0_10px_14px_rgba(36,55,31,.28)]"
          />
          <p className="mb-2 ml-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            {form.id ? "Editar posição" : "Nova posição"}
          </p>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Nome (ex: Tesouro Selic, Ações XP)"
            className="w-full rounded-card border border-line bg-paper/40 px-4 py-3 text-base text-ink outline-none focus:border-accent"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1.5 ml-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                Investido
              </p>
              <div className="rounded-card border border-line bg-paper/40 px-1 py-0.5">
                <AmountInput cents={form.investedCents} onChange={(c) => set("investedCents", c)} compact />
              </div>
            </div>
            <div>
              <p className="mb-1.5 ml-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                Meta
              </p>
              <div className="rounded-card border border-line bg-paper/40 px-1 py-0.5">
                <AmountInput cents={form.goalCents} onChange={(c) => set("goalCents", c)} compact />
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!form.name.trim()}
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
          <Plus size={18} strokeWidth={2.4} /> Nova posição
        </button>
      )}

      {investments.length === 0 && !form ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-10 text-center text-sm text-muted">
          <Sprout className="mx-auto mb-2 opacity-40" size={28} strokeWidth={1.6} />
          Nenhum investimento ainda.
          <br />
          Cadastre suas posições e a meta de cada uma.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {investments.map((inv) => {
            const pct = inv.goalCents > 0 ? Math.min(100, (inv.investedCents / inv.goalCents) * 100) : 0;
            return (
              <li
                key={inv.id}
                className="flex flex-col gap-2 rounded-card border border-line bg-surface px-3.5 py-3 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-data-soft text-data">
                    <Sprout size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{inv.name}</p>
                    <p className="mt-0.5 text-[12.5px] text-muted">
                      {formatBRL(inv.investedCents)}
                      {inv.goalCents > 0 ? ` de ${formatBRL(inv.goalCents)}` : " · sem meta"}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => startEdit(inv)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:text-accent"
                  >
                    <Pencil size={16} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remover"
                    onClick={() => onRemove(inv.id)}
                    className="rounded-lg p-1.5 text-line transition-colors hover:text-accent"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
                {inv.goalCents > 0 && (
                  <div className="h-2 overflow-hidden rounded-full bg-data-soft/60">
                    <div
                      className="h-full rounded-full bg-data transition-[width] duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
