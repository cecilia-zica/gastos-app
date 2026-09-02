/**
 * Mascara dados sensiveis (CPF, agencia/conta) que vazam na descricao de
 * extratos bancarios (comum em titulo de Pix: "Pix enviado para X CPF ...").
 * Cada padrao e ancorado em pontuacao/palavra-chave especifica pra evitar
 * falso positivo em numeros que nao sao CPF/conta.
 */

const CPF_FORMATADO = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;
const CPF_ANCORADO = /\bcpf\s*:?\s*(\d{11})\b/gi;
const AGENCIA_ANCORADA = /\b(ag(?:[eê]ncia)?\.?\s*:?\s*)(\d{2,6})\b/gi;
const CONTA_ANCORADA = /\b(c[\/.]?c\.?|conta)(\s*:?\s*)(\d{3,10}-?\d?)\b/gi;

export function maskSensitiveData(text: string): string {
  let out = text.replace(CPF_FORMATADO, "***.***.***-**");
  out = out.replace(CPF_ANCORADO, (match, digits: string) => match.replace(digits, "***.***.***-**"));
  out = out.replace(AGENCIA_ANCORADA, (_m, prefix: string, digits: string) => `${prefix}${"*".repeat(digits.length)}`);
  out = out.replace(
    CONTA_ANCORADA,
    (_m, prefix: string, sep: string, digits: string) => `${prefix}${sep}${digits.replace(/\d/g, "*")}`,
  );
  return out;
}
