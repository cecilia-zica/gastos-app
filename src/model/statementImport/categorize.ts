/**
 * Sugestao de categoria por palavra-chave no nome do estabelecimento/descricao.
 * Sem match -> null (fica em branco, pra usuaria decidir na revisao).
 */
const RULES: { category: string; keywords: RegExp }[] = [
  { category: "Saúde", keywords: /farmac|drogaria|clinic|laborat[oó]rio|hospital|dentist|psi\b/i },
  { category: "Mercado", keywords: /mercado|supermercado|super loja|hortifruti|sacol[aã]o|atacad/i },
  { category: "Transporte", keywords: /uber|99app|99pop|taxi|latam|gol linhas|azul linhas|posto|combust[ií]vel|estacionamento/i },
  { category: "Restaurante", keywords: /restaurante|churrascaria|espetin|rodizio|self.?service/i },
  { category: "Lanches/cafés", keywords: /lanchonete|pizza|padaria|cafe\b|cafeteria|sorveteria|acai|lanches/i },
  { category: "Assinaturas", keywords: /netflix|spotify|amazon prime|hbo|disney|assinatura|claude|openai|chatgpt/i },
  { category: "Educação", keywords: /escola|faculdade|curso|udemy|english|ingl[eê]s|universidade|ufsc/i },
  { category: "Esporte", keywords: /academia|wellhub|gympass|esporte clube|clube de regatas/i },
  { category: "Roupas", keywords: /moda|roupa|cal[cç]ados|vestu[aá]rio/i },
  { category: "Compras", keywords: /mercado livre|shopee|amazon\.com|magalu|americanas/i },
  { category: "Presentes", keywords: /presente|floricultura/i },
];

export function categorize(description: string): string | null {
  const found = RULES.find((r) => r.keywords.test(description));
  return found ? found.category : null;
}
