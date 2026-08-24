# Backlog — Miúdos (app de gastos)

> App mobile-first para anotar gastos do dia a dia, substituindo a captura na
> "Planilha Financeira da Annalu 2026". O app é o dono dos dados; a planilha
> vira um espelho alimentado por sync de mão única.

Última atualização: 2026-08-24

---

## Status atual

- [x] **Fase 1 — App funcional (local)** — FEITO e testado no navegador.
  - Duas telas com navegação inferior:
    - **Registrar** (singela): saudação tenra + captura rápida (valor, descrição,
      data, categoria, forma de pagamento) + lista "Hoje". Sem total do mês na cara.
    - **Histórico**: meses do mais recente ao mais antigo; cada mês abre com a
      quebra por categoria (barrinhas + contagem). É aqui que os totais moram.
  - Funciona **offline** (persistência em `localStorage`).
  - Estética "Caderno riso" (ver README), acento rosa-terroso tenro. Só ícones, nunca emoji.
  - Costura de persistência (`src/lib/store.ts`) pronta para trocar por Firestore
    sem tocar em nenhum componente.
- [ ] **Fase 0 — Setup de nuvem** — DEPENDE DE VOCÊ (ver abaixo).
- [ ] **Fase 2 — Sync com a planilha** — depende da Fase 0.
- [ ] **Fase 3 — Polir / PWA instalável / ajustar estética juntas.**

---

## O que precisa de VOCÊ (em ordem)

### 1. Criar o projeto Firebase  `[bloqueia Fase 2]`
1. Acesse https://console.firebase.google.com e crie um projeto (ex: "miudos").
2. Em **Build > Firestore Database**, crie o banco (modo produção, região `southamerica-east1` / São Paulo).
3. Em **Build > Authentication > Sign-in method**, ative **Google**.
4. Em **Project settings > General > Your apps**, registre um app **Web** e copie o
   objeto `firebaseConfig` (apiKey, authDomain, projectId, etc.).
5. Cole esses valores num arquivo `.env` na raiz (modelo em `.env.example`).
   - Me avise quando tiver feito: eu implemento o `FirestoreStore` e troco 1 linha
     em `src/App.tsx`. O resto do app não muda.

### 2. Preparar a planilha-sandbox  `[bloqueia Fase 2]`
- Planilha de desenvolvimento (cópia segura, **a original não é tocada**):
  - **Nome:** `[SANDBOX APP] Planilha Financeira 2026 - dev do app`
  - **ID:** `1Q92aUhiFm2rSsKxYKQiiRABHazD1jg_Ro3wOHQFp2k0`
- Decisão travada: o app escreve numa **aba nova e limpa "Lançamentos (App)"**
  (tabela plana com coluna de id), não nas tabelas mensais. Sync completo
  (criar/editar/apagar) fica seguro.
- O que preciso de você aqui:
  - [ ] Confirmar se quer que eu **religue seus dashboards** para lerem da aba nova,
        ou se prefere que eu monte um **resumo novo** que lê dela (mantendo os antigos).
  - [ ] Depois: publicar o Apps Script (passo 3) — precisa do seu login Google.

### 3. Publicar o Apps Script (writer)  `[eu escrevo o código, você publica]`
- Eu entrego o código do Apps Script. Você:
  - [ ] Abre a planilha-sandbox > **Extensões > Apps Script**, cola o código.
  - [ ] **Implantar > Nova implantação > App da Web**, executar como você,
        acesso "qualquer pessoa com o link", copia a URL.
  - [ ] Define um segredo compartilhado (eu explico onde).
- A Cloud Function do Firebase chama essa URL a cada gasto novo/editado/apagado.

### 4. Hospedar o app pra usar no celular  `[Fase 3]`
- [ ] Escolher hospedagem grátis (recomendo **Firebase Hosting**, já que usaremos
      Firebase; alternativas: Vercel, Netlify). Eu configuro; você faz o login.
- [ ] Instalar na tela inicial do iPhone (PWA) — eu finalizo manifest + ícones.
  - Falta gerar os ícones `icon-192.png`, `icon-512.png`, `icon-maskable.png`
    (hoje o manifest aponta para eles mas os arquivos ainda não existem).

---

## Decisões travadas (log)

| Tema | Decisão |
|---|---|
| Fonte da verdade | App é dono dos dados; planilha é espelho (sync mão única app → planilha) |
| Dispositivos | Celular + notebook sincronizados → exige nuvem (Firebase) |
| Escopo v1 | Só lançamento cru: data, valor, categoria, forma de pagamento, descrição |
| Ambição | Single-user agora; schema já namespaced por usuário para virar produto depois |
| Alvo do sync | Aba nova "Lançamentos (App)" (não as tabelas mensais) |
| Editar/apagar | Sync completo: app e planilha sempre idênticos |
| Stack | PWA React + Vite + Tailwind + Firebase (Firestore/Auth/Functions) + Apps Script |
| UI | Só ícones (Lucide), **nunca emoji**. Estética "Caderno riso" |

---

## Roadmap / ideias futuras (pós-v1)

- Cartão de crédito de verdade: parcelas, a qual fatura o gasto cai, controle "pago?".
- Cartões nomeados (Nubank, Nu Cred, etc.) como formas de pagamento.
- Tela de histórico do mês (não só "Hoje") + filtros por categoria.
- Gráficos no app (top categorias, entradas x saídas) lendo do próprio banco.
- Personalizar categorias pela usuária (doc `settings` já previsto no modelo).
- Reserva/investimentos/metas (as outras abas da planilha) — bem depois.
- Virar produto para a dona da planilha (multi-usuário) — refatorar auth/isolamento.

## Perguntas em aberto pra você

1. Dashboards: religar para a aba nova, ou manter os antigos e eu montar um resumo novo? (ver item 2)
2. Nome do app: "Miúdos" é um placeholder meu (trocados/miudezas). Curtiu ou troca?
