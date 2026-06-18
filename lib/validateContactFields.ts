import { getPhoneValidationError } from './validatePhone';

const NAME_PATTERN = /^[\p{L}' -]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Step1Field = 'firstName' | 'lastName' | 'email' | 'phone';

export type Step1FieldErrors = Partial<Record<Step1Field, string>>;

function getNameValidationError(value: string, label: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return `Please enter your ${label.toLowerCase()}.`;
  }
  if (trimmed.length < 2) {
    return `${label} must be at least 2 characters.`;
  }
  if (!NAME_PATTERN.test(trimmed)) {
    return `${label} can only contain letters, spaces, hyphens, and apostrophes.`;
  }
  return null;
}

function getEmailValidationError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Please enter your email address.';
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validateStep1Fields(fields: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Step1FieldErrors {
  const errors: Step1FieldErrors = {};

  const firstNameError = getNameValidationError(fields.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = getNameValidationError(fields.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;

  const emailError = getEmailValidationError(fields.email);
  if (emailError) errors.email = emailError;

  const phoneError = getPhoneValidationError(fields.phone, { required: true });
  if (phoneError) errors.phone = phoneError;

  return errors;
}

export function getStep1SummaryError(errors: Step1FieldErrors): string {
  const messages = Object.values(errors);
  return messages[0] ?? 'Please fix the highlighted fields before continuing.';
}
