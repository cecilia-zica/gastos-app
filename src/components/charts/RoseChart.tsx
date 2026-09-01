import { CATEGORY_ICON } from "../../shared/catalog";
import type { CatAgg } from "../../model/analytics";

interface Props {
  items: CatAgg[];
  formatValue: (cents: number) => string;
}

/* paleta categorica propria (nao usa --warn, que e semantico/reservado pra alerta) */
const PALETTE = ["#5c6aa0", "#43602f", "#b1637e", "#6f7a2f", "#8a7a4a", "#4a5a6b"];

/**
 * Rosa de Nightingale: uma fatia por categoria, angulo igual, raio
 * proporcional ao valor — "rosa de gastos" (tema herbario, pun intencional).
 */
export default function RoseChart({ items, formatValue }: Props) {
  if (items.length === 0) return null;
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 8;
  const max = Math.max(1, ...items.map((i) => i.cents));
  const n = items.length;
  const anglePer = (2 * Math.PI) / n;

  function point(angle: number, r: number) {
    return [cx + r * Math.sin(angle), cy - r * Math.cos(angle)];
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Rosa de gastos por categoria">
        {items.map((it, i) => {
          const r = Math.max(10, (it.cents / max) * maxR);
          const a0 = i * anglePer;
          const a1 = (i + 1) * anglePer;
          const [x0, y0] = point(a0, r);
          const [x1, y1] = point(a1, r);
          const large = anglePer > Math.PI ? 1 : 0;
          const d = `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
          return (
            <path
              key={it.category}
              d={d}
              fill={PALETTE[i % PALETTE.length]}
              fillOpacity={0.88}
              stroke="var(--surface)"
              strokeWidth={1.5}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={22} fill="var(--surface)" stroke="var(--line)" />
      </svg>

      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
        {items.map((it, i) => {
          const Icon = CATEGORY_ICON[it.category];
          return (
            <li key={it.category} className="flex items-center gap-1.5 text-[12px]">
              <span
                className="h-2.5 w-2.5 flex-none rounded-full"
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              />
              {Icon ? <Icon size={12} strokeWidth={2} className="flex-none text-ink-soft" /> : null}
              <span className="min-w-0 flex-1 truncate text-ink-soft">{it.category}</span>
              <span className="mono flex-none tabular text-muted">{formatValue(it.cents)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
