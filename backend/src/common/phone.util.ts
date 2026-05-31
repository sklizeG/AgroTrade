/** Нормализация российского номера для EspoCRM (+7XXXXXXXXXX). */
export function formatRussianPhoneForEspo(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) {
    return undefined;
  }

  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+7${digits}`;
  }

  return undefined;
}

/** Пустой телефон допустим; непустой должен нормализоваться для CRM. */
export function isValidRussianPhone(raw: string | null | undefined): boolean {
  if (!raw?.trim()) {
    return true;
  }

  return formatRussianPhoneForEspo(raw) !== undefined;
}
