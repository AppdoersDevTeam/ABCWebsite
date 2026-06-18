const PHONE_INPUT_PATTERN = /^[+]?[\d\s().-]+$/;

// NZ mobiles: 02x xxx xxxx nationally, or +64 2x xxx xxxx internationally.
const NZ_MOBILE_NATIONAL_PATTERN = /^2\d{8}$/;

export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d\s().+-]/g, '');
}

function getNzNationalDigits(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed || !PHONE_INPUT_PATTERN.test(trimmed)) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.startsWith('64')) {
    return digits.slice(2);
  }

  if (digits.startsWith('0')) {
    return digits.slice(1);
  }

  return null;
}

export function isValidNzMobileNumber(phone: string): boolean {
  const national = getNzNationalDigits(phone);
  if (!national) {
    return false;
  }

  return NZ_MOBILE_NATIONAL_PATTERN.test(national);
}

export function getPhoneValidationError(
  phone: string,
  options: { required?: boolean } = {}
): string | null {
  const { required = false } = options;
  const trimmed = phone.trim();

  if (!trimmed) {
    return required ? 'Please enter your mobile number.' : null;
  }

  if (!isValidNzMobileNumber(phone)) {
    return 'Please enter a valid New Zealand mobile number (e.g. 021 123 4567).';
  }

  return null;
}
