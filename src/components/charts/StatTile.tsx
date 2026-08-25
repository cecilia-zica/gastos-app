import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  /** Destaque: usa fundo laranja para o número-herói do resumo. */
  hero?: boolean;
}

/** Stat tile — um número que se lê de relance (dataviz: nem tudo é gráfico). */
export default function StatTile({ label, value, hint, icon, hero }: Props) {
  return (
    <div
      className={[
        "flex flex-col gap-1 rounded-card border p-4 shadow-card",
        hero
          ? "border-accent/40 bg-accent-soft"
          : "border-line bg-surface",
      ].join(" ")}
    >
      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted">
        {icon}
        {label}
      </div>
      <div
        className={[
          "mono tabular leading-none",
          hero ? "text-[1.9rem] text-accent-ink" : "text-[1.35rem] text-ink",
        ].join(" ")}
      >
        {value}
      </div>
      {hint ? <div className="text-[12px] text-muted">{hint}</div> : null}
    </div>
  );
}
