# Plano — Gastos fixos recorrentes

## Objetivo
Cadastrar gastos que se repetem todo mês (aluguel, assinaturas, Psi...). Eles
aparecem **automaticamente** a cada mês. Uma **aba Fixos** permite editar; editar
muda **daqui pra frente** (meses passados ficam como estavam).

## Modelo (model/)
- `Recurring` (template): id, description, amountCents, category, payment,
  dayOfMonth (1..28), since "YYYY-MM", until "YYYY-MM" | null (null = em curso).
- `Expense` ganha `recurringId?` — marca ocorrências geradas de um fixo.

## Materialização (model/recurring.ts — puro, testável)
- `occurrenceId(recId, mes)` = `rec:{recId}:{mes}` (id determinístico → idempotente).
- `occurrencesForMonth(recurrings, mes)` → Expense[] dos fixos ativos naquele mês.
- `missingOccurrences(recurrings, existentes, ateMes)` → só as que faltam criar,
  de `since` até o mês atual (back-fill dos meses já passados + o atual).

## Regra "editar muda daqui pra frente"
Ao editar/remover um fixo estando no mês atual C:
- Atualiza o template (novos valores valem de C em diante).
- Apaga as ocorrências de C em diante (serão recriadas com o novo valor); as de
  meses < C ficam intactas (histórico preservado).
- Remover = fim do fixo: `until = C-1` e apaga ocorrências >= C (ou remove o
  template se C <= since).

## Camadas (MVC)
- `model/recurringStore.ts` — persistência dos templates (localStorage; Firestore na Fase 2).
- `controllers/useRecurring.ts` — CRUD dos templates + materialização + regra "daqui pra frente".
- `views/FixosView.tsx` — aba pra listar/adicionar/editar/remover.
- `components/TabBar.tsx` — 4ª aba "Fixos".

## Testes (Vitest)
`model/recurring.test.ts`: occurrenceId, occurrencesForMonth (respeita since/until),
missingOccurrences (não duplica ids), e o corte since/until.

## Seed
`public/seed-fixos.json` (gitignored): os 6 recorrentes reais (since 2026-07).
