import { CONTACT_FORM_RECIPIENT } from './constants';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export function submitContactForm(
  formData: ContactFormData
): { success: boolean; message: string } {
  const subject = encodeURIComponent(`Website Contact Form - ${formData.subject}`);
  const body = encodeURIComponent(
    [
      `First Name: ${formData.firstName}`,
      `Last Name: ${formData.lastName || '—'}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone || 'Not provided'}`,
      '',
      'Message:',
      formData.message,
    ].join('\n')
  );

  window.location.href = `mailto:${CONTACT_FORM_RECIPIENT}?subject=${subject}&body=${body}`;

  return {
    success: true,
    message: 'Your email app should open with your message ready to send.',
  };
}
