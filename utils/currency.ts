/**
 * Formata um valor numérico como moeda de Cabo Verde (CVE)
 */
export function formatCurrency(value: number): string {
  // CVE não costuma usar centavos na exibição comum, mas vamos manter 2 casas decimais
  return `CVE ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Converte uma string de moeda para número
 * Ex: "CVE 1.234,56" -> 1234.56
 */
export function parseCurrency(value: string): number {
  // Remove tudo exceto números, vírgula e ponto
  const cleaned = value.replace(/[^\d,.-]/g, '');
  
  // Substitui vírgula por ponto e remove pontos (milhares)
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata um valor para input de moeda
 */
export function formatCurrencyInput(value: number): string {
  if (value === 0) return '';
  
  const formatted = value.toFixed(2).replace('.', ',');
  return formatted;
}
