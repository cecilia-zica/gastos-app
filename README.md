# Miúdos

App mobile-first para anotar gastos do dia a dia, rapidinho. Fase 1: captura
offline funcionando. Sync com Google Sheets vem na Fase 2 (ver [BACKLOG.md](./BACKLOG.md)).

## Rodar localmente

```bash
npm install
npm run dev      # abre em http://localhost:5173
```

Outros scripts:

```bash
npm run build      # build de producao (gera dist/)
npm run preview    # serve o build em http://localhost:4173
npm run typecheck  # checagem de tipos
```

## Como está organizado

```
src/
  types.ts              Modelo de dados (Expense). Valor em centavos (inteiro).
  lib/
    store.ts            Costura de persistencia. Hoje LocalStorageStore;
                        Fase 2 troca por FirestoreStore com a MESMA interface.
    config.ts           Categorias e formas de pagamento (icones Lucide).
    format.ts           Formatacao BRL e datas (pt-BR).
  components/
    Summary.tsx         Cabecalho-resumo do mes.
    QuickAdd.tsx        Cartao de captura (o coracao do app).
    AmountInput.tsx     Input do valor estilo banco (digitos -> centavos).
    CategoryChips.tsx   Chips de categoria (rolagem horizontal).
    PaymentChips.tsx    Grade de formas de pagamento.
    EntryList.tsx       Lista dos gastos de hoje.
  App.tsx               Estado e composicao da tela.
```

## Design — "Caderno riso"

Impressao risografica + caderno de bolso. Tinta verde-garrafa (`--ink`) sobre
papel morno com grao, e um unico acento rosa-fluor (`--accent`) usado com
parcimonia. Numeros em Fragment Mono (cara de cupom), titulos em Bricolage
Grotesque, corpo em Hanken Grotesk. Tokens em [`src/index.css`](./src/index.css).

Regra do projeto: **só ícones (Lucide), nunca emoji.**

## Persistencia

Hoje os dados ficam em `localStorage` (funciona offline, sem conta). A interface
`ExpenseStore` isola isso do resto do app — na Fase 2 entra o Firestore (offline +
sync celular/notebook + login Google) trocando so a instancia em `App.tsx`.
