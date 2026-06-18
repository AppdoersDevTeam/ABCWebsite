import { CONTACT_FORM_RECIPIENT } from './constants';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const recipientEmail = CONTACT_FORM_RECIPIENT;
const formEndpoint = `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`;

const RULE = '────────────────────────────────────────';

function buildEmailSubject(formData: ContactFormData): string {
  return `Website Contact Form - ${formData.subject}`;
}

function buildEmailBody(formData: ContactFormData): string {
  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim();

  const sections: string[] = [
    'NEW CONTACT FORM SUBMISSION',
    'Ashburton Baptist Church website',
    RULE,
    '',
    'CONTACT DETAILS',
    `First Name: ${formData.firstName}`,
    `Last Name:  ${formData.lastName?.trim() || 'Not provided'}`,
    `Name:       ${fullName || formData.firstName}`,
    `Email:      ${formData.email}`,
    `Phone:      ${formData.phone?.trim() || 'Not provided'}`,
    `Subject:    ${formData.subject}`,
  ];

  if (formData.message.trim()) {
    sections.push('', RULE, '', 'MESSAGE', formData.message.trim());
  }

  sections.push('', RULE, '', `Reply to: ${formData.email}`);

  return sections.join('\n');
}

export const submitContactForm = async (
  formData: ContactFormData
): Promise<{ success: boolean; message: string }> => {
  try {
    const payload: Record<string, string> = {
      message: buildEmailBody(formData),
      _subject: buildEmailSubject(formData),
      _replyto: formData.email,
      _template: 'box',
      _captcha: 'false',
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
      message: `Thank you! Your message has been sent. We will get back to you soon.`,
    };
  } catch {
    return {
      success: false,
      message: `We could not send your message right now. Please email us directly at ${recipientEmail}.`,
    };
  }
};
