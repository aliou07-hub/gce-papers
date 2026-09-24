/**
 * Normalizes a Cameroonian phone number to a consistent storage format:
 * "6XXXXXXXX" (9 digits, no country code, no spaces). Accepts input with or
 * without a "+237"/"237" prefix and with spaces/dashes.
 */
export function normalizePhone(input: string): string | null {
  const digitsOnly = input.replace(/[^0-9]/g, "");
  let n = digitsOnly;
  if (n.startsWith("237")) n = n.slice(3);
  if (n.length !== 9) return null;
  if (!/^[26]\d{8}$/.test(n)) return null;
  return n;
}

export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}
