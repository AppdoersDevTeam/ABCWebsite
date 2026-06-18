import { CONTACT_FORM_RECIPIENT } from './constants';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const formEndpoint = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_FORM_RECIPIENT)}`;

export async function submitContactForm(
  formData: ContactFormData
): Promise<{ success: boolean; message: string }> {
  try {
    const payload: Record<string, string> = {
      _subject: `Website Contact Form - ${formData.subject}`,
      _replyto: formData.email,
      _template: 'table',
      _captcha: 'false',
      'First Name': formData.firstName,
      'Last Name': formData.lastName || '—',
      Email: formData.email,
      Phone: formData.phone || 'Not provided',
      Subject: formData.subject,
      Message: formData.message,
    };

    const response = await fetch(formEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const detail =
        errorBody && typeof errorBody === 'object' && 'message' in errorBody
          ? String(errorBody.message)
          : '';
      throw new Error(detail || 'Failed to send message');
    }

    return {
      success: true,
      message: 'Thank you! Your message has been sent. We will get back to you soon.',
    };
  } catch {
    return {
      success: false,
      message: `We could not send your message right now. Please email us directly at ${CONTACT_FORM_RECIPIENT}.`,
    };
  }
}
