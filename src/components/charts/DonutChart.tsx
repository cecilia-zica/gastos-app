export interface DonutSlice {
  key: string;
  label: string;
  cents: number;
  color: string;
}

interface Props {
  slices: DonutSlice[];
  formatValue: (cents: number) => string;
}

/** Rosca de distribuicao — poucas fatias (3-4), rotulo direto na legenda. */
export default function DonutChart({ slices, formatValue }: Props) {
  const total = slices.reduce((s, sl) => s + sl.cents, 0);
  const size = 168;
  const r = 62;
  const stroke = 22;
  const c = 2 * Math.PI * r;

  let acc = 0;
  const segments = slices
    .filter((s) => s.cents > 0)
    .map((s) => {
      const frac = total > 0 ? s.cents / total : 0;
      const dash = frac * c;
      const seg = { ...s, dash, offset: acc };
      acc += dash;
      return seg;
    });

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribuição do dinheiro">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
          {segments.map((s) => (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${c - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          className="mono"
          style={{ fontSize: 10, fill: "var(--muted)" }}
        >
          total
        </text>
        <text
          x={size / 2}
          y={size / 2 + 13}
          textAnchor="middle"
          className="mono tabular"
          style={{ fontSize: 13, fill: "var(--ink)" }}
        >
          {formatValue(total)}
        </text>
      </svg>

      <ul className="flex flex-1 flex-col gap-2.5">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-[13px]">
            <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ backgroundColor: s.color }} />
            <span className="min-w-0 flex-1 truncate text-ink-soft">{s.label}</span>
            <span className="mono flex-none tabular text-muted">{formatValue(s.cents)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
