/** Formas de pagamento do v1. Cartoes nomeados entram em versao futura. */
export type Payment = "Dinheiro" | "Pix" | "Débito" | "Crédito";

/** Um gasto. amountCents em centavos (inteiro) para evitar erro de float. */
export interface Expense {
  id: string;
  amountCents: number;
  description: string;
  category: string;
  payment: Payment;
  /** Data do gasto no formato ISO "YYYY-MM-DD". Define a qual mes pertence. */
  date: string;
  /** Momento de criacao (epoch ms). */
  createdAt: number;
  /** Controle do sync de mao unica para a planilha (Fase 2). */
  syncedToSheet?: boolean;
}

export type NewExpense = Omit<Expense, "id" | "createdAt" | "syncedToSheet">;
