export type IntroInquiryDefaults = {
  subject: string;
  body: string;
};

/**
 * Default outreach copy for pending signups. Admins can edit before sending.
 */
export function buildIntroInquiryDefaults(firstName?: string | null): IntroInquiryDefaults {
  const name =
    (firstName || '').trim() ||
    'there';

  return {
    subject: 'A quick hello from Ashburton Baptist Church',
    body: `Kia ora ${name},

Thanks for creating a member account with Ashburton Baptist Church. Before we approve new accounts, we like to say hello and make sure we know a little about who is joining us.

We'd love to hear from you:

- How did you come to hear of us?
- Have you been along to one of our Sunday services yet?
- Are you looking to get more involved, or is there something specific that brought you to our website?
- Is there anything we can do to help you feel welcome?

Just reply to this email — it comes straight to the church office at office@ashburtonbaptist.co.nz, and someone from the team will get back to you.

Sunday services are at 10:00am, 284 Havelock Street, Ashburton. You're very welcome anytime.

Warm regards,
Ashburton Baptist Church
office@ashburtonbaptist.co.nz`,
  };
}
