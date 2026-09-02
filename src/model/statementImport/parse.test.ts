import { describe, expect, it } from "vitest";
import { detectFormat, parseStatement } from "./parse";

// Amostras reais (anonimizadas) das faturas testadas manualmente na sessão.
const NUBANK_FATURA = `date,title,amount
2026-08-29,Farmacia Preco Popular,"7,99"
2026-08-28,Latam Air*Ntxkju,"357,77"
2026-08-23,Angeloni Farmacia,"16,99"
2026-08-22,Mr Smoke,"42,80"
2026-08-09,Pagamento recebido,"- 183,30"
2026-08-07,Dm *Open English - Parcela 8/12,"193,75"
`;

const C6_EXTRATO = `Data Lançamento,Data Contábil,Título,Descrição,Entrada(R$),Saída(R$),Saldo do Dia(R$)
16/08/2026,17/08/2026,"DEBITO DE CARTAO ",PaulaRamos             FLORIANOPOLIS BRA,0.00,7.00,173.96
16/08/2026,17/08/2026,Pix recebido de LUCIANA CALDAS ZICA,Pix recebido de LUCIANA CALDAS ZICA,100.00,0.00,173.96
18/08/2026,17/08/2026,"DEBITO DE CARTAO ",FARMACIA SAO JOAO      FLORIANOPOLIS BRA,0.00,39.90,173.96
20/08/2026,20/08/2026,Pix enviado para PABLO CESAR NIMA ZETA,TRANSF ENVIADA PIX,0.00,10.00,173.96
22/08/2026,24/08/2026,"DEBITO DE CARTAO ",ANGELONI SUPER LOJA 11 FLORIANOPOLIS BRA,0.00,11.21,33.75
`;

describe("detectFormat", () => {
  it("reconhece a fatura do Nubank", () => {
    expect(detectFormat(NUBANK_FATURA)).toBe("nubank-fatura");
  });

  it("reconhece o extrato do C6", () => {
    expect(detectFormat(C6_EXTRATO)).toBe("c6-extrato");
  });

  it("marca formato desconhecido como unknown", () => {
    expect(detectFormat("foo,bar\n1,2\n")).toBe("unknown");
  });
});

describe("parseStatement — fatura Nubank", () => {
  const { rows } = parseStatement(NUBANK_FATURA);

  it("ignora o pagamento recebido (não é gasto)", () => {
    expect(rows.some((r) => r.description === "Pagamento recebido")).toBe(false);
    expect(rows).toHaveLength(5);
  });

  it("converte valor em BRL pra centavos", () => {
    const farmacia = rows.find((r) => r.description === "Farmacia Preco Popular");
    expect(farmacia?.amountCents).toBe(799);
  });

  it("sugere categoria por palavra-chave conhecida", () => {
    const farmacia = rows.find((r) => r.description === "Farmacia Preco Popular");
    expect(farmacia?.suggestedCategory).toBe("Saúde");
    expect(farmacia?.confidence).toBe("high");
  });

  it("deixa sem sugestão o que não reconhece", () => {
    const smoke = rows.find((r) => r.description === "Mr Smoke");
    expect(smoke?.suggestedCategory).toBeNull();
    expect(smoke?.confidence).toBe("low");
  });

  it("usa Crédito como forma de pagamento (é fatura de cartão)", () => {
    expect(rows.every((r) => r.suggestedPayment === "Crédito")).toBe(true);
  });
});

describe("parseStatement — extrato C6", () => {
  const { rows } = parseStatement(C6_EXTRATO);

  it("ignora entradas (Pix recebido), mantém só saídas", () => {
    expect(rows.every((r) => r.direction === "out")).toBe(true);
    expect(rows).toHaveLength(4);
  });

  it("converte data BR pra ISO", () => {
    const farmacia = rows.find((r) => r.description.includes("FARMACIA SAO JOAO"));
    expect(farmacia?.date).toBe("2026-08-18");
  });

  it("distingue Pix de Débito pela descrição", () => {
    const pix = rows.find((r) => r.description.includes("PABLO CESAR"));
    const debito = rows.find((r) => r.description.includes("FARMACIA SAO JOAO"));
    expect(pix?.suggestedPayment).toBe("Pix");
    expect(debito?.suggestedPayment).toBe("Débito");
  });

  it("sugere Mercado pro supermercado", () => {
    const mercado = rows.find((r) => r.description.includes("ANGELONI SUPER LOJA"));
    expect(mercado?.suggestedCategory).toBe("Mercado");
  });
});

describe("parseStatement — mascara CPF no titulo do Pix", () => {
  const CSV_COM_CPF = `Data Lançamento,Data Contábil,Título,Descrição,Entrada(R$),Saída(R$),Saldo do Dia(R$)
20/08/2026,20/08/2026,Pix enviado para JOAO DA SILVA CPF 123.456.789-00,TRANSF ENVIADA PIX,0.00,50.00,100.00
`;

  it("nao salva o CPF completo na descricao", () => {
    const { rows } = parseStatement(CSV_COM_CPF);
    expect(rows).toHaveLength(1);
    expect(rows[0].description).not.toContain("123.456.789-00");
    expect(rows[0].description).toBe("Pix enviado para JOAO DA SILVA CPF ***.***.***-**");
  });
});
