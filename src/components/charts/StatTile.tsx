import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  /** Destaque: usa fundo roxo pro número-herói do resumo. */
  hero?: boolean;
  /** Numero menor, pra grades apertadas (3+ colunas). */
  compact?: boolean;
}

/** Stat tile — um número que se lê de relance (dataviz: nem tudo é gráfico). */
export default function StatTile({ label, value, hint, icon, hero, compact }: Props) {
  return (
    <div
      className={[
        "flex min-w-0 flex-col gap-1 rounded-card border p-4 shadow-card",
        hero ? "border-accent/40 bg-accent-soft" : "border-line bg-surface",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-1.5 truncate text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={[
          "mono tabular leading-none truncate",
          hero ? "text-[1.9rem] text-accent-ink" : compact ? "text-[1.05rem] text-ink" : "text-[1.35rem] text-ink",
        ].join(" ")}
      >
        {value}
      </div>
      {hint ? <div className="truncate text-[12px] text-muted">{hint}</div> : null}
    </div>
  );
}
