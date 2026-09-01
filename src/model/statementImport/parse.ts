import type { Payment } from "../types";
import { categorize } from "./categorize";

export interface ParsedRow {
  date: string; // ISO "YYYY-MM-DD"
  description: string;
  amountCents: number;
  direction: "in" | "out";
  suggestedCategory: string | null;
  suggestedPayment: Payment;
  confidence: "high" | "low";
}

export type StatementFormat = "nubank-fatura" | "c6-extrato" | "generic" | "unknown";

/** Parser CSV minimo: da conta de campos entre aspas com virgula dentro. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function parseLines(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "")
    .map(splitCsvLine);
}

function brDateToISO(d: string): string {
  const [dd, mm, yyyy] = d.split("/");
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

/** "7,99" ou "- 183,30" -> centavos (negativo se estorno/entrada). */
function brValueToCents(raw: string): number {
  const cleaned = raw.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  return Math.round(parseFloat(cleaned) * 100);
}

function usValueToCents(raw: string): number {
  return Math.round(parseFloat(raw) * 100);
}

export function detectFormat(text: string): StatementFormat {
  const header = (text.split(/\r?\n/)[0] ?? "").toLowerCase();
  if (header.startsWith("date,title,amount")) return "nubank-fatura";
  if (header.includes("data lançamento") && header.includes("entrada") && header.includes("saída")) {
    return "c6-extrato";
  }
  if (header.includes("date") || header.includes("data")) return "generic";
  return "unknown";
}

function toRow(date: string, description: string, amountCents: number, direction: "in" | "out", payment: Payment): ParsedRow {
  const suggestion = categorize(description);
  return {
    date,
    description,
    amountCents,
    direction,
    suggestedCategory: suggestion,
    suggestedPayment: payment,
    confidence: suggestion ? "high" : "low",
  };
}

/** Fatura de cartão Nubank: date,title,amount (amount negativo = pagamento recebido). */
function parseNubankFatura(text: string): ParsedRow[] {
  const rows = parseLines(text).slice(1);
  return rows
    .filter((r) => r.length >= 3)
    .map(([date, title, amountRaw]) => {
      const cents = brValueToCents(amountRaw);
      const direction: "in" | "out" = cents < 0 ? "in" : "out";
      return toRow(date, title, Math.abs(cents), direction, "Crédito");
    })
    .filter((r) => r.direction === "out"); // pagamentos/estornos ficam de fora
}

/** Extrato de conta C6: Data Lançamento,Data Contábil,Título,Descrição,Entrada,Saída,Saldo. */
function parseC6Extrato(text: string): ParsedRow[] {
  const rows = parseLines(text).slice(1);
  return rows
    .filter((r) => r.length >= 6)
    .map(([dataLanc, , titulo, descricaoRaw, entrada, saida]) => {
      const entradaCents = usValueToCents(entrada || "0");
      const saidaCents = usValueToCents(saida || "0");
      const isPix = /pix/i.test(titulo) || /pix/i.test(descricaoRaw);
      const payment: Payment = isPix ? "Pix" : "Débito";
      // No Pix, quem/pra-quem fica no Título ("Pix enviado para..."); a
      // Descrição e so boilerplate ("TRANSF ENVIADA PIX"). No debito de
      // cartao e o oposto: Titulo e generico, Descricao tem o estabelecimento.
      const descricao = /^pix (enviado|recebido)/i.test(titulo) ? titulo : descricaoRaw;
      const date = brDateToISO(dataLanc);
      if (saidaCents > 0) return toRow(date, descricao, saidaCents, "out", payment);
      return toRow(date, descricao, entradaCents, "in", payment);
    })
    .filter((r) => r.direction === "out");
}

/** Best-effort pra CSVs desconhecidos: acha colunas por nome. */
function parseGeneric(text: string): ParsedRow[] {
  const [headerLine, ...rest] = parseLines(text);
  const header = headerLine.map((h) => h.toLowerCase());
  const dateIdx = header.findIndex((h) => h.includes("date") || h.includes("data"));
  const descIdx = header.findIndex((h) => h.includes("desc") || h.includes("títul") || h.includes("title"));
  const amountIdx = header.findIndex((h) => h.includes("valor") || h.includes("amount"));
  if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) return [];

  return rest
    .filter((r) => r.length > Math.max(dateIdx, descIdx, amountIdx))
    .map((r) => {
      const rawDate = r[dateIdx];
      const date = rawDate.includes("/") ? brDateToISO(rawDate) : rawDate;
      const amountRaw = r[amountIdx];
      const cents = amountRaw.includes(",") ? brValueToCents(amountRaw) : usValueToCents(amountRaw);
      const direction: "in" | "out" = cents < 0 ? "in" : "out";
      return toRow(date, r[descIdx], Math.abs(cents), direction, "Débito");
    })
    .filter((r) => r.direction === "out");
}

export function parseStatement(text: string): { format: StatementFormat; rows: ParsedRow[] } {
  const format = detectFormat(text);
  if (format === "nubank-fatura") return { format, rows: parseNubankFatura(text) };
  if (format === "c6-extrato") return { format, rows: parseC6Extrato(text) };
  if (format === "generic") return { format, rows: parseGeneric(text) };
  return { format, rows: [] };
}
