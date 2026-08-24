import { formatBRL, formatCents } from "../lib/format";

interface Props {
  monthLabel: string;
  monthTotalCents: number;
  count: number;
  todayCents: number;
}

/** Cabecalho-resumo: quanto gastei no mes. Tinta escura, selo riso. */
export default function Summary({
  monthLabel,
  monthTotalCents,
  count,
  todayCents,
}: Props) {
  const [int, dec] = formatCents(monthTotalCents).split(",");
  return (
    <section
      className="rise relative overflow-hidden rounded-card px-6 py-6 text-paper shadow-card"
      style={{ animationDelay: "80ms", background: "linear-gradient(155deg, #14342b, #1f4a3c)" }}
    >
      {/* selo riso deslocado ao fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,63,108,.45), transparent 70%)" }}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9db4a6]">
        Gastei em {monthLabel}
      </p>
      <p className="mono mt-1 flex items-baseline gap-1 text-[2.7rem] font-normal leading-none tabular">
        <span className="text-lg text-[#9db4a6]">R$</span>
        <span>{int}</span>
        <span className="text-2xl text-[#9db4a6]">,{dec}</span>
      </p>
      <div className="mt-4 flex gap-5 text-[13px] text-[#b9cabe]">
        <span>
          <b className="font-semibold text-paper">{count}</b> lançamento{count === 1 ? "" : "s"}
        </span>
        <span>
          hoje <b className="mono font-normal tabular text-paper">{formatBRL(todayCents)}</b>
        </span>
      </div>
    </section>
  );
}
