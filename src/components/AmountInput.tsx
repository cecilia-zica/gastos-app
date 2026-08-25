import { useRef } from "react";
import { formatCents } from "../shared/format";

interface Props {
  cents: number;
  onChange: (cents: number) => void;
}

/**
 * Input hero do valor. Constroi o numero a partir dos digitos (estilo
 * banco): teclado numerico, cada digito empurra os centavos. Grande,
 * em mono, centralizado — o cupom fiscal do app.
 */
export default function AmountInput({ cents, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const display = cents > 0 ? formatCents(cents) : "";

  function handle(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    onChange(digits ? parseInt(digits, 10) : 0);
  }

  return (
    <div
      className="flex items-baseline justify-center gap-1.5 py-1 cursor-text"
      onClick={() => ref.current?.focus()}
    >
      <span className="mono text-2xl text-muted select-none">R$</span>
      <input
        ref={ref}
        inputMode="numeric"
        aria-label="Valor do gasto"
        autoFocus
        value={display}
        onChange={(e) => handle(e.target.value)}
        placeholder="0,00"
        className="mono bg-transparent border-0 outline-none text-ink text-center
                   text-[3.4rem] leading-none font-normal tabular
                   w-full max-w-[8ch] placeholder:text-line caret-accent"
      />
    </div>
  );
}
