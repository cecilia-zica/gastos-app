import { useRef, useState } from "react";
import { Upload, AlertTriangle, FileText, Check, X, Copy } from "lucide-react";
import { parseStatement, type ParsedRow } from "../model/statementImport/parse";
import { findLikelyDuplicate } from "../model/statementImport/duplicates";
import { CATEGORIES, PAYMENTS } from "../shared/catalog";
import { formatBRL } from "../shared/format";
import type { Expense, NewExpense, Payment } from "../model/types";

interface ReviewRow extends ParsedRow {
  include: boolean;
  category: string; // "" = sem categoria
  payment: Payment;
  duplicateOf?: Expense;
}

interface Props {
  existingExpenses: Expense[];
  onImport: (rows: NewExpense[]) => void;
  onDone: () => void;
}

/** Aba Importar extrato — só CSV por agora (Nubank fatura, C6 extrato, genérico). */
export default function ImportarView({ existingExpenses, onImport, onDone }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ReviewRow[] | null>(null);
  const [empty, setEmpty] = useState(false);

  async function handleFile(file: File) {
    setFileName(file.name);
    const text = await file.text();
    const { rows: parsed } = parseStatement(text);
    if (parsed.length === 0) {
      setEmpty(true);
      setRows(null);
      return;
    }
    setEmpty(false);
    setRows(
      parsed.map((r) => {
        const duplicateOf = findLikelyDuplicate(r, existingExpenses);
        return {
          ...r,
          include: !duplicateOf,
          category: r.suggestedCategory ?? "",
          payment: r.suggestedPayment,
          duplicateOf,
        };
      }),
    );
  }

  function set<K extends keyof ReviewRow>(i: number, key: K, value: ReviewRow[K]) {
    setRows((cur) => cur && cur.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  }

  const includedCount = rows?.filter((r) => r.include).length ?? 0;

  function confirmImport() {
    if (!rows) return;
    const toImport: NewExpense[] = rows
      .filter((r) => r.include)
      .map((r) => ({
        amountCents: r.amountCents,
        description: r.description,
        category: r.category,
        payment: r.payment,
        date: r.date,
      }));
    onImport(toImport);
    onDone();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rise px-1" style={{ animationDelay: "40ms" }}>
        <h2 className="font-display text-2xl font-bold tracking-tight">Importar extrato</h2>
        <p className="mt-0.5 text-[13.5px] text-muted">CSV do banco — eu leio e você confere</p>
      </div>

      {!rows && (
        <section
          className="rise flex flex-col items-center gap-3 rounded-card border border-dashed border-accent/50 bg-accent-soft/40 px-6 py-10 text-center"
          style={{ animationDelay: "90ms" }}
        >
          <Upload size={26} strokeWidth={1.8} className="text-accent-ink" />
          <p className="text-[14px] text-ink-soft">
            Fatura do cartão ou extrato da conta, exportado em CSV.
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-card bg-accent px-5 py-2.5 text-[14px] font-bold text-surface shadow-pop"
          >
            Escolher arquivo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {empty && (
            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-warn">
              <AlertTriangle size={14} strokeWidth={2.2} />
              Não reconheci o formato de "{fileName}" — tenta outro CSV.
            </p>
          )}
        </section>
      )}

      {rows && (
        <>
          <div className="rise flex items-center gap-2 rounded-card border border-line bg-surface px-4 py-3 text-[13px] text-ink-soft">
            <FileText size={16} strokeWidth={2} />
            {fileName} · {rows.length} lançamento{rows.length === 1 ? "" : "s"} encontrado
            {rows.length === 1 ? "" : "s"}
          </div>

          <ul className="flex flex-col gap-2">
            {rows.map((r, i) => (
              <li
                key={i}
                className={[
                  "rounded-card border bg-surface p-3 shadow-card transition-opacity",
                  r.include ? "border-line" : "border-line/50 opacity-50",
                ].join(" ")}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={r.include}
                    onChange={(e) => set(i, "include", e.target.checked)}
                    className="mt-1 h-4 w-4 accent-accent"
                    aria-label="Incluir na importação"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[14px] font-semibold">{r.description}</p>
                      <span className="mono flex-none text-[14px] tabular">
                        {formatBRL(r.amountCents)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-muted">{r.date}</p>

                    <div className="mt-2 flex gap-2">
                      <div className="flex-1">
                        <select
                          value={r.category}
                          onChange={(e) => set(i, "category", e.target.value)}
                          className={[
                            "w-full rounded-card border bg-paper/40 px-2.5 py-1.5 text-[12.5px]",
                            r.category === "" ? "border-warn text-warn" : "border-line text-ink",
                          ].join(" ")}
                        >
                          <option value="">— categoria pendente</option>
                          {CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.id}
                            </option>
                          ))}
                        </select>
                      </div>
                      <select
                        value={r.payment}
                        onChange={(e) => set(i, "payment", e.target.value as Payment)}
                        className="rounded-card border border-line bg-paper/40 px-2.5 py-1.5 text-[12.5px] text-ink"
                      >
                        {PAYMENTS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    {r.category === "" && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-warn">
                        <AlertTriangle size={12} strokeWidth={2.2} />
                        não reconheci — escolhe uma categoria
                      </p>
                    )}
                    {r.duplicateOf && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-warn">
                        <Copy size={12} strokeWidth={2.2} />
                        já lançado: {r.duplicateOf.description || r.duplicateOf.category} ·{" "}
                        {formatBRL(r.duplicateOf.amountCents)}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="rise sticky bottom-2 flex gap-2" style={{ animationDelay: "0ms" }}>
            <button
              type="button"
              onClick={confirmImport}
              disabled={includedCount === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-card bg-accent py-3.5 font-bold text-surface shadow-pop transition-all active:scale-[0.98] disabled:bg-line disabled:text-paper disabled:shadow-none"
            >
              <Check size={18} strokeWidth={2.5} />
              Importar {includedCount} gasto{includedCount === 1 ? "" : "s"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRows(null);
                setFileName(null);
              }}
              className="flex items-center justify-center gap-1.5 rounded-card border border-line bg-surface px-4 font-semibold text-muted"
            >
              <X size={16} /> Trocar arquivo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
