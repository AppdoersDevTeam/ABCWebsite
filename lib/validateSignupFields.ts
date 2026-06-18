import { getPhoneValidationError } from './validatePhone';

const NAME_PATTERN = /^[\p{L}' -]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignupField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'password';

export type SignupFieldErrors = Partial<Record<SignupField, string>>;

function getFirstNameError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Please enter your first name.';
  }
  if (trimmed.length < 2) {
    return 'First name must be at least 2 characters.';
  }
  if (!NAME_PATTERN.test(trimmed)) {
    return 'First name can only contain letters, spaces, hyphens, and apostrophes.';
  }
  return null;
}

function getLastNameError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length < 2) {
    return 'Last name must be at least 2 characters.';
  }
  if (!NAME_PATTERN.test(trimmed)) {
    return 'Last name can only contain letters, spaces, hyphens, and apostrophes.';
  }
  return null;
}

function getEmailError(value: string, required: boolean): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return required ? 'Please enter your email address.' : null;
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

function getPasswordError(value: string): string | null {
  if (!value) {
    return 'Please enter a password.';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  return null;
}

export function validateEmailSignupFields(fields: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): SignupFieldErrors {
  const errors: SignupFieldErrors = {};

  const firstNameError = getFirstNameError(fields.firstName);
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = getLastNameError(fields.lastName);
  if (lastNameError) errors.lastName = lastNameError;

  const emailError = getEmailError(fields.email, true);
  if (emailError) errors.email = emailError;

  const phoneError = getPhoneValidationError(fields.phone, { required: false });
  if (phoneError) errors.phone = phoneError;

  const passwordError = getPasswordError(fields.password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function getSignupSummaryError(errors: SignupFieldErrors): string {
  return Object.values(errors)[0] ?? 'Please fix the highlighted fields before continuing.';
}
