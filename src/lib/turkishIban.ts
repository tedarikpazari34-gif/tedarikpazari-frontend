export function isValidTurkishIban(iban: string): boolean {
  const normalized = iban.replace(/\s+/g, "").toUpperCase();

  if (!/^TR\d{24}$/.test(normalized)) {
    return false;
  }

  const rearranged = normalized.slice(4) + normalized.slice(0, 4);

  const expanded = rearranged.replace(
    /[A-Z]/g,
    (letter) => String(letter.charCodeAt(0) - 55)
  );

  let remainder = 0;

  for (const digit of expanded) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }

  return remainder === 1;
}
