import { PAYMENTS } from "../shared/catalog";
import type { Payment } from "../model/types";

interface Props {
  value: Payment;
  onChange: (id: Payment) => void;
}

/** Forma de pagamento — grade de 4, o eixo que a usuaria mais liga. */
export default function PaymentChips({ value, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Forma de pagamento"
      className="grid grid-cols-2 gap-2"
    >
      {PAYMENTS.map(({ id, icon: Icon }) => {
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={[
              "flex items-center justify-center gap-2 rounded-2xl border py-3",
              "text-[15px] font-medium transition-all duration-150",
              active
                ? "border-accent bg-accent-soft text-accent-ink"
                : "border-line bg-surface text-ink hover:border-ink/30",
            ].join(" ")}
          >
            <Icon size={17} strokeWidth={2.2} />
            {id}
          </button>
        );
      })}
    </div>
  );
}
