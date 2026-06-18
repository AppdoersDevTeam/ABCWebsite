const PHONE_INPUT_PATTERN = /^[+]?[\d\s().-]+$/;

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

function isValidNzMobile(national: string): boolean {
  return national.startsWith('02') && national.length >= 9 && national.length <= 11;
}

function isValidNzLandline(national: string): boolean {
  if (national.length !== 9) {
    return false;
  }

  if (/^0[3467]\d{7}$/.test(national)) {
    return true;
  }

  // 09 area codes, excluding 090 premium numbers.
  return national.startsWith('09') && !national.startsWith('090');
}

function isValidNzFreePhone(national: string): boolean {
  return (national.startsWith('050') || national.startsWith('080')) && national.length === 10;
}

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
