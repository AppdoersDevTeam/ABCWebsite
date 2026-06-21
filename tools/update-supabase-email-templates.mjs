/**
 * Push branded auth email templates to Supabase via Management API.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_ACCESS_TOKEN="sbp_..."; node tools/update-supabase-email-templates.mjs
 *
 * Create a token at: https://supabase.com/dashboard/account/tokens
 * Required scopes: auth_config_write (or project admin)
 */

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'zwxlccqhafdnvdohzxkg';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const CHURCH_LOGO_URL = 'https://ashburtonbaptistchurch.vercel.app/abc-logo.png';

const CONFIRM_SUBJECT = 'Welcome! One quick step to join our member community';

const CONFIRM_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm your account</title>
</head>
<body style="margin:0;padding:0;background-color:#A8B774;font-family:Georgia,'Times New Roman',serif;color:#222222;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#A8B774 0%,#96a866 100%);padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.12);">
          <tr>
            <td style="height:6px;background-color:#fbcb05;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 36px 20px;text-align:center;background-color:#ffffff;">
              <img src="${CHURCH_LOGO_URL}" alt="Ashburton Baptist Church" width="110" style="display:block;margin:0 auto 20px;border:0;" />
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;color:#808080;">Ashburton Baptist Church</p>
              <h1 style="margin:0 0 12px;font-size:28px;line-height:1.25;color:#222222;font-weight:normal;">You&rsquo;re almost there!</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#666666;font-style:italic;">Disciples of Jesus impacting Ashburton and the nations.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#444444;">
              <p style="margin:0 0 20px;">Kia ora — thank you for signing up for a member account on our website. We&rsquo;re glad you want to stay connected with our church family.</p>
              <p style="margin:0 0 24px;">Tap the button below to confirm your email address. It only takes a moment.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:10px;background-color:#fbcb05;box-shadow:0 4px 14px rgba(251,203,5,0.45);">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:16px 36px;font-size:17px;font-weight:bold;color:#222222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Confirm my email &rarr;</a>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px;background-color:#f8f9f4;border-radius:12px;border:1px solid #e8ecd8;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#222222;">Once you&rsquo;re confirmed &amp; approved, you&rsquo;ll have access to:</p>
                    <p style="margin:0 0 8px;font-size:15px;color:#444444;">&#10003;&nbsp; The member directory</p>
                    <p style="margin:0 0 8px;font-size:15px;color:#444444;">&#10003;&nbsp; Service rosters</p>
                    <p style="margin:0;font-size:15px;color:#444444;">&#10003;&nbsp; The prayer wall</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#808080;">Button not working? Copy and paste this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#222222;text-decoration:underline;">{{ .ConfirmationURL }}</a></p>
              <p style="margin:0;font-size:13px;color:#999999;">If you didn&rsquo;t create an account on our website, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 32px;background-color:#222222;text-align:center;">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#fbcb05;">Ashburton Baptist Church</p>
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#cccccc;">284 Havelock Street, Ashburton 7700</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
                <a href="mailto:office@ashburtonbaptist.co.nz" style="color:#ffffff;text-decoration:none;">office@ashburtonbaptist.co.nz</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.ashburtonbaptist.co.nz" style="color:#ffffff;text-decoration:none;">ashburtonbaptist.co.nz</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#ffffff;opacity:0.85;">Sent with care from your church family.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

const RECOVERY_SUBJECT = "Need to reset your password? We've got you";

const RECOVERY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#A8B774;font-family:Georgia,'Times New Roman',serif;color:#222222;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#A8B774 0%,#96a866 100%);padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.12);">
          <tr>
            <td style="height:6px;background-color:#fbcb05;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 36px 20px;text-align:center;background-color:#ffffff;">
              <img src="${CHURCH_LOGO_URL}" alt="Ashburton Baptist Church" width="110" style="display:block;margin:0 auto 20px;border:0;" />
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;color:#808080;">Ashburton Baptist Church</p>
              <h1 style="margin:0;font-size:28px;line-height:1.25;color:#222222;font-weight:normal;">Reset your password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#444444;">
              <p style="margin:0 0 20px;">We received a request to reset the password for your member account.</p>
              <p style="margin:0 0 24px;">Click the button below to choose a new password. This link will expire after a short time for your security.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:10px;background-color:#fbcb05;box-shadow:0 4px 14px rgba(251,203,5,0.45);">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:16px 36px;font-size:17px;font-weight:bold;color:#222222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Reset my password &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#808080;">Button not working? Copy and paste this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#222222;text-decoration:underline;">{{ .ConfirmationURL }}</a></p>
              <p style="margin:0;font-size:13px;color:#999999;">If you didn&rsquo;t request a password reset, you can safely ignore this email — your password won&rsquo;t change.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 32px;background-color:#222222;text-align:center;">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#fbcb05;">Ashburton Baptist Church</p>
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#cccccc;">284 Havelock Street, Ashburton 7700</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
                <a href="mailto:office@ashburtonbaptist.co.nz" style="color:#ffffff;text-decoration:none;">office@ashburtonbaptist.co.nz</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.ashburtonbaptist.co.nz" style="color:#ffffff;text-decoration:none;">ashburtonbaptist.co.nz</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

async function main() {
  if (!TOKEN) {
    console.error('Missing SUPABASE_ACCESS_TOKEN.');
    console.error('Create one at https://supabase.com/dashboard/account/tokens');
    console.error('Then run: $env:SUPABASE_ACCESS_TOKEN="sbp_..."; node tools/update-supabase-email-templates.mjs');
    process.exit(1);
  }

  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;
  const body = {
    mailer_subjects_confirmation: CONFIRM_SUBJECT,
    mailer_templates_confirmation_content: CONFIRM_HTML,
    mailer_subjects_recovery: RECOVERY_SUBJECT,
    mailer_templates_recovery_content: RECOVERY_HTML,
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`Failed (${res.status}):`, text);
    process.exit(1);
  }

  console.log('Email templates updated successfully for project', PROJECT_REF);
  console.log('- Confirm signup subject:', CONFIRM_SUBJECT);
  console.log('- Reset password subject:', RECOVERY_SUBJECT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
