# Fase 2 — Nuvem (Firebase) + Planilha (Apps Script): passo a passo

Objetivo: os dados saem do navegador e vão pra **nuvem** (persistem, com backup,
sincronizando note + celular) e cada lançamento é **empurrado pra planilha**.

Arquitetura escolhida (custo zero, sem cartão): o app grava no **Firestore**
(fonte da verdade, offline + sync) e, quando online, **chama direto o Apps Script**
da planilha (sem Cloud Functions, sem plano pago).

Legenda: **[VOCÊ]** = você clica · **[EU]** = eu escrevo o código.

---

## Parte 1 — Criar o Firebase  [VOCÊ] (~10 min)

1. Acesse https://console.firebase.google.com e clique **Adicionar projeto**.
   Nome: `wert` (ou o que quiser). Pode desativar o Google Analytics.
2. No menu esquerdo: **Criação > Firestore Database > Criar banco de dados**.
   - Modo: **produção**. Local: **southamerica-east1 (São Paulo)**.
3. Menu: **Criação > Authentication > Comece agora > aba Sign-in method**.
   - Ative **Google** (escolha seu e-mail como e-mail de suporte) > Salvar.
4. Menu: **engrenagem (Configurações do projeto) > aba Geral**. Role até
   **Seus apps** > clique no ícone **Web `</>`**. Apelido: `wert-web` > Registrar.
5. Vai aparecer um bloco `const firebaseConfig = { apiKey: ..., ... }`.
   **Copie esses valores** e me mande (ou preencha o `.env` — modelo em `.env.example`).

Quando me mandar a config: **[EU]** implemento o login com Google, a persistência
no Firestore (offline + sync) e troco a fonte de dados do app — sem você mexer em código.

---

## Parte 2 — Ligar o app na nuvem  [EU]

Com a config: instalo o `firebase`, escrevo `model/firebaseStore.ts` (implementa a
mesma interface `ExpenseStore`, então nenhuma tela muda), adiciono uma tela simples de
**Entrar com Google**, e o app passa a salvar na nuvem. Testamos juntas anotando algo
no note e vendo aparecer.

---

## Parte 3 — Alimentar a planilha (Apps Script)  [VOCÊ] (~10 min)

> Fazemos na planilha **SANDBOX** (a original fica intocada):
> `[SANDBOX APP] Planilha Financeira 2026`.

1. Abra a planilha sandbox > menu **Extensões > Apps Script**.
2. Apague o conteúdo e **cole** o código de `apps-script/Codigo.gs` (deste repo).
3. Na linha `var SEGREDO = "TROQUE-ESTE-SEGREDO";` troque por uma frase secreta sua.
   Guarde essa frase — vou precisar dela. **Salvar** (ícone de disquete).
4. (Opcional) Menu **Executar > _teste** pra ele criar a aba "Lançamentos (App)" e uma
   linha de teste. Autorize os acessos quando pedir.
5. **Implantar > Nova implantação**. Engrenagem > tipo **App da Web**.
   - **Executar como:** eu (sua conta) · **Quem tem acesso:** Qualquer pessoa.
   - **Implantar** > autorize > **copie a URL** do app da web.
6. Me mande **a URL** e **o segredo**. **[EU]** ligo o app pra empurrar cada
   lançamento (criar/editar/apagar) pra essa aba.

---

## Parte 4 — Publicar pra instalar no iPhone  [EU + VOCÊ] (~5 min)

1. **[EU]** gero os ícones do app e configuro o deploy (Firebase Hosting, grátis).
2. **[VOCÊ]** faz o login no serviço quando eu pedir.
3. Fica uma URL fixa `https://...`. No iPhone (Safari): **Compartilhar >
   Adicionar à Tela de Início**. Vira app com ícone.

---

## Ordem sugerida

Parte 1 agora (você) → eu faço a Parte 2 → Parte 3 (você) → eu ligo → Parte 4.
Cada etapa a gente testa antes de seguir.
