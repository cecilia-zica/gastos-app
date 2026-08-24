const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Centavos (inteiro) -> "R$ 1.234,56". */
export function formatBRL(cents: number): string {
  return BRL.format(cents / 100);
}

/** Centavos -> "1.234,56" (sem simbolo), para o input hero. */
export function formatCents(cents: number): string {
  const [int, dec] = (cents / 100).toFixed(2).split(".");
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + dec;
}

/** Data ISO local de hoje ("YYYY-MM-DD"), respeitando fuso. */
export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

/** "YYYY-MM" de uma data ISO. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "2026-08-21" -> "qui, 21 ago". */
export function formatDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DIAS[dt.getDay()]}, ${d} ${MESES[m - 1].slice(0, 3)}`;
}

/** Nome do mes por extenso capitalizado: "Agosto". */
export function monthName(iso: string): string {
  const m = Number(iso.slice(5, 7));
  const n = MESES[m - 1];
  return n.charAt(0).toUpperCase() + n.slice(1);
}
