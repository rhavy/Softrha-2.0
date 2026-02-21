/**
 * SOFT RHA - Utilitários de Validação e Formatação (Padrão Enterprise)
 * Focado em integridade de dados para o Dashboard Administrativo.
 */

// --- VALIDAÇÕES ---

export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) return false;

  const calculateDigit = (slice: string, factor: number) => {
    let sum = 0;
    for (const digit of slice) {
      sum += parseInt(digit) * factor--;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cleanCPF.substring(0, 9), 10);
  const secondDigit = calculateDigit(cleanCPF.substring(0, 10), 11);

  return (
    firstDigit === parseInt(cleanCPF.charAt(9)) &&
    secondDigit === parseInt(cleanCPF.charAt(10))
  );
}

export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, "");

  if (cleanCNPJ.length !== 14 || /^(\d)\1+$/.test(cleanCNPJ)) return false;

  const calculateDigit = (slice: string) => {
    let weight = 2;
    let sum = 0;
    // O peso do CNPJ volta para 2 após atingir 9
    for (let i = slice.length - 1; i >= 0; i--) {
      sum += parseInt(slice.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cleanCNPJ.substring(0, 12));
  const secondDigit = calculateDigit(cleanCNPJ.substring(0, 13));

  return (
    firstDigit === parseInt(cleanCNPJ.charAt(12)) &&
    secondDigit === parseInt(cleanCNPJ.charAt(13))
  );
}

export function validateEmail(email: string): boolean {
  // Regex seguindo padrões da RFC para garantir segurança no Better Auth
  const emailRegex = /^[a-zA-Z0-0.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-0](?:[a-zA-Z0-0-]{0,61}[a-zA-Z0-0])?(?:\.[a-zA-Z0-0](?:[a-zA-Z0-0-]{0,61}[a-zA-Z0-0])?)*$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  // Aceita 10 (fixo) ou 11 (celular) dígitos. DDIs brasileiros começam de 11 a 99.
  return /^[1-9]{2}9?[0-9]{8}$/.test(cleanPhone);
}

export function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, "");
  return cleanCEP.length === 8 && /^\d{8}$/.test(cleanCEP);
}

// --- FORMATAÇÕES (Design de Elite) ---

export const formatCPF = (v: string) => {
  if (!v) return "";
  const clean = String(v).replace(/\D/g, "");
  if (clean.length !== 11) return v;
  return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
};

export const formatCNPJ = (v: string) => {
  if (!v) return "";
  const clean = String(v).replace(/\D/g, "");
  if (clean.length !== 14) return v;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
};

export const formatCEP = (v: string) => {
  if (!v) return "";
  const clean = String(v).replace(/\D/g, "");
  if (clean.length !== 8) return v;
  return clean.replace(/^(\d{5})(\d{3}).*/, "$1-$2");
};

export const formatPhone = (v: string) => {
  if (!v) return "";
  const r = String(v).replace(/\D/g, "");
  if (r.length > 10) return r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
  if (r.length === 10) return r.replace(/^(\d\d)(\d{4})(\d{4}).*/, "($1) $2-$3");
  return v;
};