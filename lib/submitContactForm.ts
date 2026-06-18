import { CONTACT_FORM_RECIPIENT } from './constants';

export interface ChildEntry {
  name: string;
  age: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  spouseFirstName?: string;
  spouseLastName?: string;
  ageBracket?: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  children?: ChildEntry[];
  firstTimeVisitor?: boolean;
  beenBefore?: boolean;
  committedToJesus?: boolean;
  recommittedToJesus?: boolean;
  wantConnectGroup?: boolean;
  interestedInBaptism?: boolean;
  talkToPastor?: boolean;
  wantNewsletter?: boolean;
  wantMembership?: boolean;
  wantVolunteer?: boolean;
  knowMoreAbout?: string;
  prayerRequest?: string;
}

const recipientEmail = CONTACT_FORM_RECIPIENT;
const formEndpoint = `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`;

const RULE = '────────────────────────────────────────';

function formatYesNo(value: boolean | undefined): string {
  return value ? 'Yes' : 'No';
}

function buildEmailSubject(formData: ContactFormData): string {
  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim();
  return `Website Connect Form - ${fullName}`;
}

function buildEmailBody(formData: ContactFormData): string {
  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim();

  const sections: string[] = [
    'NEW CONNECT FORM SUBMISSION',
    'Ashburton Baptist Church website',
    RULE,
    '',
    'CONTACT DETAILS',
    `First Name:   ${formData.firstName}`,
    `Last Name:    ${formData.lastName}`,
    `Full Name:    ${fullName}`,
    `Spouse First: ${formData.spouseFirstName?.trim() || 'Not provided'}`,
    `Spouse Last:  ${formData.spouseLastName?.trim() || 'Not provided'}`,
    `Spouse Name:  ${[formData.spouseFirstName, formData.spouseLastName].filter(Boolean).join(' ').trim() || 'Not provided'}`,
    `Age:          ${formData.ageBracket?.trim() || 'Not provided'}`,
    `Email:        ${formData.email}`,
    `Phone:        ${formData.phone?.trim() || 'Not provided'}`,
    `Address:      ${formData.addressLine1?.trim() || 'Not provided'}`,
    `              ${formData.addressLine2?.trim() || ''}`.trimEnd(),
  ];

  sections.push('', 'CHILDREN');
  const children = formData.children ?? [];
  if (children.some((child) => child.name.trim() || child.age.trim())) {
    children.forEach((child, index) => {
      if (child.name.trim() || child.age.trim()) {
        sections.push(
          `  ${index + 1}. ${child.name.trim() || 'Not provided'} (Age: ${child.age.trim() || 'Not provided'})`
        );
      }
    });
  } else {
    sections.push('  Not provided');
  }

  sections.push(
    '',
    RULE,
    '',
    'VISITOR STATUS',
    `1st Time Visitor:  ${formatYesNo(formData.firstTimeVisitor)}`,
    `I've Been Before:  ${formatYesNo(formData.beenBefore)}`,
    '',
    'START',
    `Committed life to Jesus:     ${formatYesNo(formData.committedToJesus)}`,
    `Recommitted life to Jesus:   ${formatYesNo(formData.recommittedToJesus)}`,
    '',
    'NEXT STEP',
    `Join a Connect Group:        ${formatYesNo(formData.wantConnectGroup)}`,
    `Interested in baptism:      ${formatYesNo(formData.interestedInBaptism)}`,
    `Talk to a Pastor:            ${formatYesNo(formData.talkToPastor)}`,
    `Weekly newsletter:           ${formatYesNo(formData.wantNewsletter)}`,
    '',
    'GET INVOLVED',
    `Become a member:             ${formatYesNo(formData.wantMembership)}`,
    `Volunteer for a ministry:    ${formatYesNo(formData.wantVolunteer)}`,
    '',
    RULE,
    '',
    "I'D LIKE TO KNOW MORE ABOUT",
    formData.knowMoreAbout?.trim() || 'Not provided',
    '',
    'PRAYER REQUEST',
    formData.prayerRequest?.trim() || 'Not provided'
  );

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
