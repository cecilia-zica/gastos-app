import type { ExpenseStore } from "./store";
import type { NewExpense } from "./types";

/**
 * Semente de desenvolvimento: se o app estiver vazio, puxa uma foto dos
 * gastos reais lidos da planilha hoje (arquivo /seed-gastos.json, gerado
 * fora do build e NÃO versionado). É uma leitura pontual só para ver dados
 * reais — o sync de verdade (duas vias) é a Fase 2 com o Firebase.
 * Se o arquivo não existir, o app simplesmente começa vazio.
 */
let started = false;

export async function loadSeedIfEmpty(store: ExpenseStore): Promise<void> {
  // guard síncrono: evita semear em dobro no StrictMode (efeito roda 2x em dev)
  if (started) return;
  started = true;
  if (store.size() > 0) return;
  try {
    const res = await fetch("/seed-gastos.json", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as NewExpense[];
    if (Array.isArray(data) && data.length > 0) {
      await store.importMany(data);
    }
  } catch {
    // sem seed disponível — segue vazio, sem drama.
  }
}
