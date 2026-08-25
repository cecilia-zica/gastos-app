# Plano — Aba Dashboard (Resumo)

> Terceira aba do app, espelhando os dashboards da planilha original, porém só
> com os dados que o v1 coleta hoje (saídas/gastos). Feito com processo:
> requisitos → pré-requisitos → testes → código → testar → validar.

## 1. Objetivo

Dar à usuária um panorama visual dos gastos — para onde o dinheiro foi — numa aba
dedicada, calma e bonita. Substitui a leitura dos gráficos da aba "Resumo anual"
da planilha, mas dentro do app.

## 2. Pré-requisitos

- [x] Fase 1 pronta: modelo `Expense`, store local, navegação por abas.
- [x] Skill de dataviz carregada (método: forma → cor por último → validar com script).
- [x] Nova paleta quente definida (laranja/taupe/creme/amarelo) aplicada nos tokens.
- [ ] Framework de teste: **Vitest** (encaixa no Vite; testa as funções puras de agregação).

## 3. Requisitos funcionais

Painéis (mapeados aos da planilha), calculados a partir das saídas:

| # | Painel | Origem na planilha | Forma (dataviz) |
|---|---|---|---|
| RF1 | Total de saídas + nº lançamentos + média/dia | "Total de Saídas" | stat tiles (hero) |
| RF2 | Onde você gastou mais (ranking de categorias) | "RANKING DE GASTOS / Top 5 categorias" | barras horizontais, hue único |
| RF3 | Gastos por forma de pagamento | "Gastos por tipo de pagamento" | barras horizontais, hue único |
| RF4 | Saídas ao longo dos meses | "Entradas X Saídas ao longo do ano" | barras verticais, 1 série |
| RF5 | Destaques: maior gasto, menor gasto, forma mais usada | "Maior gasto / Menor gasto / Forma mais usada" | stat tiles |
| RF6 | Filtro de período: mês atual / ano / tudo | dashboards eram anuais | segmented control acima dos gráficos |

Regras de dataviz aplicadas:
- Rankings de magnitude usam **um único hue** (laranja); a identidade vem do rótulo
  no eixo, não da cor → evita problema de daltonismo por não codificar categoria em cor.
- 1 série → sem legenda (o título nomeia). Marcas finas, ponta arredondada 4px na base.
- Rótulos diretos seletivos (valor no fim da barra), grid recessivo.
- Hover/tooltip por marca (bônus; v1 pode começar com rótulo direto sempre visível).

## 4. Fora de escopo (v1) — precisa de dados que o app ainda não coleta

- Entradas/receitas, "Entradas X Saídas", "Minha saúde financeira", teto de gasto,
  reserva, investimentos, metas. Entram quando o app passar a registrar entradas.

## 5. Requisitos não-funcionais

- Offline (usa os dados locais já existentes).
- Puro/rápido: agregação em funções puras memoizáveis; sem dependência pesada de chart.
  Gráficos desenhados em SVG/CSS próprios (controle estético + self-contained).
- Acessível: contraste AA no texto; identidade nunca só por cor; `prefers-reduced-motion`.
- Estética "Caderno riso" na nova paleta quente. Só ícones (Lucide), nunca emoji.

## 6. Design técnico

- `src/lib/analytics.ts` — **funções puras** (testáveis), sem React:
  - `filterByPeriod(expenses, period, refISO)`
  - `sumCents`, `count`, `dayAverageCents`
  - `topCategories`, `byPayment`, `monthlyTotals`
  - `maxExpense`, `minExpense`, `mostUsedPayment`
  - `buildDashboard(expenses)` compõe tudo para a view.
- `src/components/charts/` — `StatTile`, `BarList` (barras horizontais), `MonthBars`
  (barras verticais). Burros: recebem dados já agregados.
- `src/views/DashboardView.tsx` — compõe filtro + painéis.
- `src/components/TabBar.tsx` — adiciona a 3ª aba (Resumo).

## 7. Plano de testes (Vitest, antes do código da UI)

`src/lib/analytics.test.ts` cobre:
- vazio → zeros e `undefined` sem quebrar;
- soma e contagem corretas;
- média/dia = total ÷ dias distintos;
- `topCategories` ordena desc e soma por categoria;
- `byPayment` soma por forma;
- `monthlyTotals` agrupa por mês e ordena asc;
- `maxExpense`/`minExpense` corretos, incl. empates;
- `mostUsedPayment` por contagem;
- `filterByPeriod` (mês/ano/tudo) filtra certo.

## 8. Validação

- `npm run test` verde.
- `node scripts/validate_palette.js` (skill dataviz) para as cores de dado usadas.
- `npm run typecheck` + `npm run build` verdes.
- Screenshots da aba no navegador (layout, sem colisão de rótulos, sem overflow).

## 9. Passos de execução

1. Aplicar paleta nova + renomear para "wert".
2. Configurar Vitest.
3. Escrever testes de `analytics`.
4. Implementar `analytics.ts` até os testes passarem.
5. Implementar charts + DashboardView + 3ª aba.
6. Testar, typecheck, build, validar paleta, screenshots.
7. Commit.
