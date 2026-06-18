const PHONE_INPUT_PATTERN = /^[+]?[\d\s().-]+$/;

const LANDLINE_AREA_CODES = ['03', '04', '06', '07'] as const;

export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d\s().+-]/g, '');
}

function getNationalNumber(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed || !PHONE_INPUT_PATTERN.test(trimmed)) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.startsWith('64')) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith('0')) {
    return digits;
  }

  return null;
}

/** Mobile: begins with 02, 9–11 digits total (including 02). */
function isValidNzMobile(national: string): boolean {
  return national.startsWith('02') && national.length >= 9 && national.length <= 11;
}

/** Landline: area 03/04/06/07/09 (not 090), 7 local digits after area code (9 digits total). */
function isValidNzLandline(national: string): boolean {
  if (national.length !== 9) {
    return false;
  }

  for (const code of LANDLINE_AREA_CODES) {
    if (national.startsWith(code)) {
      return /^\d{7}$/.test(national.slice(code.length));
    }
  }

  if (national.startsWith('09') && !national.startsWith('090')) {
    return /^\d{7}$/.test(national.slice(2));
  }

  return false;
}

/** Free phone: begins with 050 or 080, 10 digits total. */
function isValidNzFreePhone(national: string): boolean {
  return (national.startsWith('050') || national.startsWith('080')) && national.length === 10;
}

/** Premium rate: begins with 090, 9–11 digits total. */
function isValidNzPremiumRate(national: string): boolean {
  return national.startsWith('090') && national.length >= 9 && national.length <= 11;
}

export function isValidNzPhoneNumber(phone: string): boolean {
  const national = getNationalNumber(phone);
  if (!national) {
    return false;
  }

  return (
    isValidNzPremiumRate(national) ||
    isValidNzFreePhone(national) ||
    isValidNzMobile(national) ||
    isValidNzLandline(national)
  );
}

/** Convert a validated NZ number to E.164 for Supabase Auth (+64…). */
export function normalizePhoneForAuth(phone: string): string | null {
  const national = getNationalNumber(phone);
  if (!national || !isValidNzPhoneNumber(phone)) {
    return null;
  }
  return `+64${national.slice(1)}`;
}

/** @deprecated Use isValidNzPhoneNumber */
export function isValidNzMobileNumber(phone: string): boolean {
  return isValidNzPhoneNumber(phone);
}

export function getPhoneValidationError(
  phone: string,
  options: { required?: boolean } = {}
): string | null {
  const { required = false } = options;
  const trimmed = phone.trim();

  if (!trimmed) {
    return required ? 'Please enter your phone number.' : null;
  }

  if (!isValidNzPhoneNumber(phone)) {
    return 'Please enter a valid New Zealand phone number (e.g. 021 123 4567 or 03-308 5409).';
  }

  return null;
}
