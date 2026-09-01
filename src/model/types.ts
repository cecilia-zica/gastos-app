/** Formas de pagamento. "Caju" = cartao de beneficio, muito usado pela usuaria. */
export type Payment = "Dinheiro" | "Pix" | "Débito" | "Crédito" | "Caju";

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
  /** Se veio de um gasto fixo recorrente, o id do template. */
  recurringId?: string;
}

export type NewExpense = Omit<Expense, "id" | "createdAt" | "syncedToSheet">;

/** Template de gasto fixo que se repete todo mes. */
export interface Recurring {
  id: string;
  description: string;
  amountCents: number;
  category: string;
  payment: Payment;
  /** Dia do mes (1..28) em que o gasto cai. */
  dayOfMonth: number;
  /** Mes inicial inclusive, "YYYY-MM". */
  since: string;
  /** Mes final inclusive "YYYY-MM", ou null = em curso. */
  until: string | null;
}

export type NewRecurring = Omit<Recurring, "id">;

/** Uma entrada (renda). Espelha a tabela "Entradas" da planilha. */
export interface Income {
  id: string;
  amountCents: number;
  description: string;
  /** Data ISO "YYYY-MM-DD". */
  date: string;
  createdAt: number;
  syncedToSheet?: boolean;
}

export type NewIncome = Omit<Income, "id" | "createdAt" | "syncedToSheet">;

/**
 * Uma posicao de investimento: quanto ja foi investido nela vs a meta.
 * Nao e um lancamento por transacao — e o estado atual da posicao.
 */
export interface Investment {
  id: string;
  name: string;
  investedCents: number;
  goalCents: number;
  createdAt: number;
}

export type NewInvestment = Omit<Investment, "id" | "createdAt">;

/** Teto de gasto por categoria (vale pra todo mes ate ser trocado). */
export interface Budget {
  category: string;
  limitCents: number;
}
