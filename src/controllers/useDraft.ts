import { useState } from "react";
import type { NewExpense, Payment } from "../model/types";
import { DEFAULT_CATEGORY, DEFAULT_PAYMENT } from "../shared/catalog";
import { todayISO } from "../shared/format";

/** Estado do formulário de captura (view-model do lançamento em edição). */
export interface Draft {
  cents: number;
  description: string;
  date: string;
  category: string;
  payment: Payment;
}

export function emptyDraft(): Draft {
  return {
    cents: 0,
    description: "",
    date: todayISO(),
    category: DEFAULT_CATEGORY,
    payment: DEFAULT_PAYMENT,
  };
}

/**
 * Controller (MVC) do formulário: guarda o rascunho, valida e monta o
 * NewExpense de domínio ao salvar. Mantém categoria/pagamento/data para
 * lançamentos em sequência; limpa só valor e descrição.
 */
export function useDraft(onSave: (input: NewExpense) => Promise<unknown>) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const canSave = draft.cents > 0;

  async function save(): Promise<boolean> {
    if (!canSave) return false;
    await onSave({
      amountCents: draft.cents,
      description: draft.description.trim(),
      category: draft.category,
      payment: draft.payment,
      date: draft.date,
    });
    setDraft((d) => ({ ...d, cents: 0, description: "" }));
    return true;
  }

  return { draft, set, canSave, save };
}
