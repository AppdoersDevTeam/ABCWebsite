const LOGO_URL = "https://ashburtonbaptist.co.nz/abc-logo.png";
const DEFAULT_SITE_URL = "https://ashburtonbaptist.co.nz";

export const MFA_EMAIL_SUBJECT = "Your security verification code";
export const MFA_EMAIL_TEMPLATE_KEY = "mfa_verification";
export const MFA_CODE_EXPIRY_MINUTES = 10;

export function buildMfaCodeEmailHtml(params: {
  firstName: string;
  expiryMinutes?: number;
  loginUrl?: string;
  code: string;
}): string {
  const greetingName = params.firstName || "there";
  const minutes = params.expiryMinutes ?? MFA_CODE_EXPIRY_MINUTES;
  const loginUrl = params.loginUrl || `${DEFAULT_SITE_URL}/#/login`;
  const code = params.code;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your security verification code</title>
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
              <img src="${LOGO_URL}" alt="Ashburton Baptist Church" width="110" style="display:block;margin:0 auto 20px;border:0;" />
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;color:#808080;">Ashburton Baptist Church</p>
              <h1 style="margin:0 0 12px;font-size:28px;line-height:1.25;color:#222222;font-weight:normal;">Your verification code</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#666666;font-style:italic;">Use this code to finish signing in or updating your security settings.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#444444;">
              <p style="margin:0 0 20px;">Kia ora ${greetingName},</p>
              <p style="margin:0 0 20px;">Your verification code is:</p>
              <p style="margin:0 0 24px;text-align:center;font-size:32px;letter-spacing:0.35em;font-weight:bold;color:#222222;font-family:Arial,Helvetica,sans-serif;">${code}</p>
              <p style="margin:0 0 20px;">This code expires in ${minutes} minutes and can be used only once.</p>
              <p style="margin:0 0 24px;font-size:13px;color:#999999;">If you did not request this code, please secure your account and contact the church office.</p>
              <div style="margin:28px 0 0;padding-top:20px;border-top:1px solid #eeeeee;">
                <p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#444444;">
                  You can open the website Log in page here:
                  <a href="${loginUrl}" style="color:#222222;font-weight:bold;text-decoration:underline;">Log in page</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 32px;background-color:#222222;text-align:center;">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#fbcb05;">Ashburton Baptist Church</p>
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#cccccc;">284 Havelock Street, Ashburton 7700</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
                <a href="mailto:office@ashburtonbaptist.co.nz" style="color:#ffffff;text-decoration:none;">office@ashburtonbaptist.co.nz</a>
                &nbsp;&middot;&nbsp;
                <a href="https://ashburtonbaptist.co.nz" style="color:#ffffff;text-decoration:none;">ashburtonbaptist.co.nz</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
