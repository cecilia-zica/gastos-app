import { useRef } from "react";
import { formatCents } from "../shared/format";

interface Props {
  cents: number;
  onChange: (cents: number) => void;
  /** Versao pequena, pra campos lado a lado (ex: investido/meta). */
  compact?: boolean;
}

/**
 * Input do valor. Constroi o numero a partir dos digitos (estilo
 * banco): teclado numerico, cada digito empurra os centavos. Em mono,
 * centralizado — o cupom fiscal do app. `compact` reduz o tamanho pra
 * caber em campos menores sem perder o mesmo comportamento.
 */
export default function AmountInput({ cents, onChange, compact }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const display = cents > 0 ? formatCents(cents) : "";

  function handle(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    onChange(digits ? parseInt(digits, 10) : 0);
  }

  return (
    <div
      className={[
        "flex items-baseline justify-center cursor-text",
        compact ? "gap-1 py-1" : "gap-1.5 py-1",
      ].join(" ")}
      onClick={() => ref.current?.focus()}
    >
      <span className={["mono text-muted select-none", compact ? "text-[13px]" : "text-2xl"].join(" ")}>
        R$
      </span>
      <input
        ref={ref}
        inputMode="numeric"
        aria-label="Valor"
        autoFocus={!compact}
        value={display}
        onChange={(e) => handle(e.target.value)}
        placeholder="0,00"
        className={[
          "mono bg-transparent border-0 outline-none text-ink text-center",
          "leading-none font-normal tabular placeholder:text-line caret-accent",
          compact ? "text-[15px] w-full max-w-[7ch]" : "text-[3.4rem] w-full max-w-[8ch]",
        ].join(" ")}
      />
    </div>
  );
}
