import { PieChart, TrendingUp, TrendingDown, Sprout, CalendarClock, Wallet } from "lucide-react";
import { useDashboard } from "../controllers/useDashboard";
import type { Period } from "../model/analytics";
import { CATEGORY_ICON, PAYMENTS } from "../shared/catalog";
import { formatBRL } from "../shared/format";
import StatTile from "../components/charts/StatTile";
import BarList, { type BarItem } from "../components/charts/BarList";
import MonthBars from "../components/charts/MonthBars";
import RoseChart from "../components/charts/RoseChart";
import DonutChart from "../components/charts/DonutChart";
import BudgetBarList from "../components/charts/BudgetBarList";
import type { Budget, Expense, Income, Investment } from "../model/types";

const PAYMENT_ICON = Object.fromEntries(PAYMENTS.map((p) => [p.id, p.icon]));

const PERIODS: { id: Period; label: string }[] = [
  { id: "month", label: "Este mês" },
  { id: "year", label: "Ano" },
  { id: "all", label: "Tudo" },
];

function Panel({
  title,
  hint,
  children,
  delay,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <section
      className="rise rounded-card border border-line bg-surface p-4 shadow-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-3.5">
        <h3 className="font-display text-[15px] font-bold">{title}</h3>
        {hint ? <p className="text-[12px] text-muted">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

interface Props {
  expenses: Expense[];
  income: Income[];
  investments: Investment[];
  budgets: Budget[];
  onSetBudgetLimit: (category: string, limitCents: number) => void;
}

/** Aba Resumo — espelha os painéis da planilha: visão geral, metas, categoria, distribuição, tempo. */
export default function DashboardView({ expenses, income, investments, budgets, onSetBudgetLimit }: Props) {
  const { period, setPeriod, data, incomeCents, investedCents, investedGoalCents, savedCents } =
    useDashboard(expenses, income, investments, budgets);

  const catItems: BarItem[] = data.topCategories.slice(0, 6).map((c) => {
    const Icon = CATEGORY_ICON[c.category];
    return {
      key: c.category,
      label: c.category,
      cents: c.cents,
      icon: Icon ? <Icon size={15} strokeWidth={2} /> : undefined,
    };
  });

  const payItems: BarItem[] = data.byPayment.map((p) => {
    const Icon = PAYMENT_ICON[p.payment];
    return {
      key: p.payment,
      label: p.payment,
      cents: p.cents,
      icon: Icon ? <Icon size={15} strokeWidth={2} /> : undefined,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="rise px-1" style={{ animationDelay: "40ms" }}>
        <h2 className="font-display text-2xl font-bold tracking-tight">Resumo</h2>
        <p className="mt-0.5 text-[13.5px] text-muted">pra onde o dinheiro foi</p>
      </div>

      {/* filtro de período — dataviz: filtros numa linha acima dos gráficos */}
      <div
        role="group"
        aria-label="Período"
        className="rise flex gap-1.5 rounded-card border border-line bg-surface p-1"
        style={{ animationDelay: "80ms" }}
      >
        {PERIODS.map((p) => {
          const active = period === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => setPeriod(p.id)}
              className={[
                "flex-1 rounded-card py-2 text-[13px] font-semibold transition-colors",
                active ? "bg-accent text-surface shadow-pop" : "text-muted hover:text-ink",
              ].join(" ")}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* ---- visão geral ---- */}
      <div className="rise flex flex-col gap-3" style={{ animationDelay: "120ms" }}>
        <StatTile
          hero
          label={savedCents >= 0 ? "Economizado" : "Estourou o orçamento"}
          value={formatBRL(Math.abs(savedCents))}
          hint={`entradas − saídas · ${data.count} lançamento${data.count === 1 ? "" : "s"}`}
        />
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile
            label="Entradas"
            value={formatBRL(incomeCents)}
            icon={<TrendingUp size={12} strokeWidth={2.2} />}
          />
          <StatTile
            label="Saídas"
            value={formatBRL(data.totalCents)}
            icon={<TrendingDown size={12} strokeWidth={2.2} />}
          />
          <StatTile
            label="Investido"
            value={formatBRL(investedCents)}
            hint={investedGoalCents > 0 ? `meta ${formatBRL(investedGoalCents)}` : undefined}
            icon={<Sprout size={12} strokeWidth={2.2} />}
          />
        </div>
      </div>

      {data.count === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-12 text-center text-sm text-muted">
          <PieChart className="mx-auto mb-2 opacity-40" size={30} strokeWidth={1.6} />
          Sem gastos nesse período.
          <br />
          Registre alguns e o resumo aparece aqui.
        </div>
      ) : (
        <>
          <div className="rise grid grid-cols-2 gap-3" style={{ animationDelay: "160ms" }}>
            <StatTile
              label="Média por dia"
              value={formatBRL(data.dayAverageCents)}
              icon={<CalendarClock size={13} strokeWidth={2.2} />}
            />
            <StatTile
              label="Forma mais usada"
              value={data.mostUsedPayment?.payment ?? "—"}
              hint={data.mostUsedPayment ? `${data.mostUsedPayment.count}x` : undefined}
              icon={<Wallet size={13} strokeWidth={2.2} />}
            />
          </div>

          {/* ---- maiores gastos ---- */}
          <Panel title="Maiores gastos" hint="top 5 do período" delay={200}>
            <ul className="flex flex-col gap-2.5">
              {data.topExpenses.map((e, i) => {
                const Icon = CATEGORY_ICON[e.category];
                return (
                  <li key={e.id} className="flex items-center gap-3">
                    <span className="mono grid h-6 w-6 flex-none place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-ink">
                      {i + 1}
                    </span>
                    {Icon ? <Icon size={16} strokeWidth={2} className="flex-none text-ink-soft" /> : null}
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">
                      {e.description || e.category}
                    </span>
                    <span className="mono flex-none text-[13.5px] tabular">{formatBRL(e.amountCents)}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {/* ---- metas (teto x real) ---- */}
          <Panel title="Metas" hint="teto x real por categoria" delay={240}>
            <BudgetBarList items={data.topCategories} budgets={budgets} onSetLimit={onSetBudgetLimit} />
          </Panel>

          {/* ---- por categoria ---- */}
          <Panel title="Rosa de gastos" hint="por categoria" delay={280}>
            <RoseChart items={data.topCategories.slice(0, 6)} formatValue={formatBRL} />
          </Panel>

          <Panel title="Onde você gastou mais" hint="por categoria" delay={300}>
            <BarList items={catItems} formatValue={formatBRL} />
          </Panel>

          <Panel title="Por forma de pagamento" delay={320}>
            <BarList items={payItems} formatValue={formatBRL} />
          </Panel>

          {/* ---- distribuição ---- */}
          <Panel title="Distribuição do dinheiro" hint="entradas, saídas e investido" delay={360}>
            <DonutChart
              formatValue={formatBRL}
              slices={[
                { key: "saidas", label: "Saídas", cents: data.totalCents, color: "#43602f" },
                { key: "investido", label: "Investido", cents: investedCents, color: "#5c6aa0" },
                {
                  key: "sobrou",
                  label: "Sobrou",
                  cents: Math.max(0, incomeCents - data.totalCents - investedCents),
                  color: "#b1637e",
                },
              ]}
            />
          </Panel>

          {/* ---- ao longo do tempo ---- */}
          {data.monthly.length > 1 ? (
            <Panel title="Saídas por mês" hint="ao longo do tempo" delay={400}>
              <MonthBars months={data.monthly} formatValue={formatBRL} />
            </Panel>
          ) : null}
        </>
      )}
    </div>
  );
}
