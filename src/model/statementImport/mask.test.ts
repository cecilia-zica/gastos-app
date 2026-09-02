import { describe, expect, it } from "vitest";
import { maskSensitiveData } from "./mask";

describe("maskSensitiveData", () => {
  it("mascara CPF formatado", () => {
    expect(maskSensitiveData("Pix enviado para JOAO DA SILVA CPF 123.456.789-00")).toBe(
      "Pix enviado para JOAO DA SILVA CPF ***.***.***-**",
    );
  });

  it("mascara CPF cru ancorado na palavra CPF", () => {
    expect(maskSensitiveData("Pagamento CPF 12345678900 recebido")).toBe(
      "Pagamento CPF ***.***.***-** recebido",
    );
  });

  it("mascara agencia e conta", () => {
    expect(maskSensitiveData("Transferencia Ag: 1234 Cc: 12345-6")).toBe(
      "Transferencia Ag: **** Cc: *****-*",
    );
  });

  it("nao mexe em texto sem dado sensivel", () => {
    const texto = "FARMACIA SAO JOAO      FLORIANOPOLIS BRA";
    expect(maskSensitiveData(texto)).toBe(texto);
  });

  it("nao mascara numero de 11 digitos sem a palavra CPF por perto", () => {
    const texto = "Pedido 12345678900 confirmado";
    expect(maskSensitiveData(texto)).toBe(texto);
  });
});
