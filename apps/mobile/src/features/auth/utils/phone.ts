/** Formats up to 8 Tunisian phone digits as "XX XXX XXX". */
export function formatTunisianPhone(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

export const toTunisianE164 = (digits: string) => `+216${digits.replace(/\D/g, '')}`;
