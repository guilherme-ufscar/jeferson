/**
 * Funções de máscara para inputs brasileiros.
 * Nenhuma dependência externa necessária.
 */

export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    // (11) 1234-5678
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  // (11) 91234-5678
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskRG(value: string): string {
  return value
    .replace(/[^0-9Xx]/g, "")
    .slice(0, 10)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})([0-9Xx]{1})$/, "$1-$2");
}

export function maskPlaca(value: string): string {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length <= 3) return clean;
  // Formato Mercosul: ABC1D23 ou antigo: ABC1234
  return clean.slice(0, 3) + "-" + clean.slice(3);
}

export function maskCurrency(value: string): string {
  // Remove tudo que não é dígito
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";

  // Remove zeros à esquerda mas mantém pelo menos 1
  digits = digits.replace(/^0+/, "") || "0";

  // Preenche com zeros se preciso (mínimo 3 dígitos para ter centavos)
  while (digits.length < 3) {
    digits = "0" + digits;
  }

  const intPart = digits.slice(0, -2);
  const decPart = digits.slice(-2);

  // Adiciona separador de milhares
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return formatted + "," + decPart;
}

export function unmaskCurrency(masked: string): number {
  if (!masked) return 0;
  // Remove pontos de milhar e troca vírgula por ponto
  const clean = masked.replace(/\./g, "").replace(",", ".");
  return parseFloat(clean) || 0;
}

export function unmaskDigits(value: string): string {
  return value.replace(/\D/g, "");
}
