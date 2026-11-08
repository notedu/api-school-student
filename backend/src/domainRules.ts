export const normalizeCpf = (cpf: string) => cpf.replace(/\D/g, "");

export function isValidCpf(cpf: string): boolean {
  const digits = normalizeCpf(cpf);
  if (!/^\d{11}$/.test(digits) || /^([0-9])\1{10}$/.test(digits)) return false;
  const checkDigit = (length: number) => {
    const sum = digits
      .slice(0, length)
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const rest = (sum * 10) % 11;
    return (rest === 10 ? 0 : rest) === Number(digits[length]);
  };
  return checkDigit(9) && checkDigit(10);
}

export const isValidPassword = (password: string) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);
export const isValidGrade = (value: unknown) =>
  Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 10;
export const isValidEvidence = (mime: string, size: number) =>
  ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(mime) &&
  size > 0 &&
  size <= 5 * 1024 * 1024;
