import { PieChart, TrendingUp, CalendarClock, Wallet, Trophy } from "lucide-react";
import { useDashboard } from "../controllers/useDashboard";
import type { Period } from "../model/analytics";
import { CATEGORY_ICON, PAYMENTS } from "../shared/catalog";
import { formatBRL } from "../shared/format";
import StatTile from "../components/charts/StatTile";
import BarList, { type BarItem } from "../components/charts/BarList";
import MonthBars from "../components/charts/MonthBars";
import type { Expense } from "../model/types";

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
}

/** Aba Resumo (dashboard) — espelha os painéis da planilha, só saídas. */
export default function DashboardView({ expenses }: Props) {
  const { period, setPeriod, data } = useDashboard(expenses);

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
        className="rise flex gap-1.5 rounded-full border border-line bg-surface p-1"
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
                "flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors",
                active ? "bg-accent text-ink shadow-pop" : "text-muted hover:text-ink",
              ].join(" ")}
            >
              {p.label}
            </button>
          );
        })}
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
          <div className="rise flex flex-col gap-3" style={{ animationDelay: "120ms" }}>
            <StatTile
              hero
              label="Total de saídas"
              value={formatBRL(data.totalCents)}
              hint={`${data.count} lançamento${data.count === 1 ? "" : "s"}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                label="Média por dia"
                value={formatBRL(data.dayAverageCents)}
                icon={<CalendarClock size={13} strokeWidth={2.2} />}
              />
              <StatTile
                label="Forma mais usada"
                value={data.mostUsedPayment?.payment ?? "—"}
                hint={
                  data.mostUsedPayment
                    ? `${data.mostUsedPayment.count}x`
                    : undefined
                }
                icon={<Wallet size={13} strokeWidth={2.2} />}
              />
            </div>
          </div>

          <Panel title="Onde você gastou mais" hint="por categoria" delay={180}>
            <BarList items={catItems} formatValue={formatBRL} />
          </Panel>

          <Panel title="Por forma de pagamento" delay={240}>
            <BarList items={payItems} formatValue={formatBRL} />
          </Panel>

          {data.monthly.length > 1 ? (
            <Panel title="Saídas por mês" hint="ao longo do tempo" delay={300}>
              <MonthBars months={data.monthly} formatValue={formatBRL} />
            </Panel>
          ) : null}

          {data.maxExpense ? (
            <Panel title="Maior gasto" delay={360}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-accent-soft text-accent-ink">
                  <Trophy size={18} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink">
                    {data.maxExpense.description || data.maxExpense.category}
                  </p>
                  <p className="flex items-center gap-1 text-[12.5px] text-muted">
                    <TrendingUp size={12} strokeWidth={2.2} />
                    {data.maxExpense.category}
                  </p>
                </div>
                <span className="mono text-[16px] font-normal tabular text-ink">
                  {formatBRL(data.maxExpense.amountCents)}
                </span>
              </div>
            </Panel>
          ) : null}
        </>
      )}
    </div>
  );
}
