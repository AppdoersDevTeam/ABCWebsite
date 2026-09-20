export type DirectoryPersonEmailKind = "added" | "archived" | "deleted";

const OFFICE_EMAIL = "office@ashburtonbaptist.co.nz";
const LOGO_URL = "https://ashburtonbaptist.co.nz/abc-logo.png";
const SITE_URL = "https://ashburtonbaptist.co.nz";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function firstNameFromDirectoryName(name: string): string {
  const first = (name || "").trim().split(/\s+/)[0];
  return first || "there";
}

export function directoryPersonEmailSubject(kind: DirectoryPersonEmailKind): string {
  if (kind === "added") {
    return "You have been added to the Ashburton Baptist Church directory";
  }
  if (kind === "archived") {
    return "Your Ashburton Baptist Church directory record has been archived";
  }
  return "Your Ashburton Baptist Church directory record has been removed";
}

function loginPageFooterHtml(loginUrl: string): string {
  return `<div style="margin:28px 0 0;padding-top:20px;border-top:1px solid #eeeeee;">
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#444444;">
                If you have a website login, you can open the Log in page here:
                <a href="${loginUrl}" style="color:#222222;font-weight:bold;text-decoration:underline;">Log in page</a>
              </p>
              <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;">
                <a href="${loginUrl}" style="color:#808080;text-decoration:underline;">${loginUrl}</a>
              </p>
            </div>`;
}

function emailShell(title: string, heading: string, innerHtml: string): string {
  const loginUrl = `${SITE_URL}/#/login`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
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
              <h1 style="margin:0 0 12px;font-size:28px;line-height:1.25;color:#222222;font-weight:normal;">${heading}</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#666666;font-style:italic;">Disciples of Jesus impacting Ashburton and the nations.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#444444;">
              ${innerHtml}
              ${loginPageFooterHtml(loginUrl)}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 32px;background-color:#222222;text-align:center;">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#fbcb05;">Ashburton Baptist Church</p>
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#cccccc;">284 Havelock Street, Ashburton 7700</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
                <a href="mailto:${OFFICE_EMAIL}" style="color:#ffffff;text-decoration:none;">${OFFICE_EMAIL}</a>
                &nbsp;&middot;&nbsp;
                <a href="${SITE_URL}" style="color:#ffffff;text-decoration:none;">ashburtonbaptist.co.nz</a>
                &nbsp;&middot;&nbsp;
                <a href="${loginUrl}" style="color:#fbcb05;text-decoration:none;">Log in</a>
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
}

function bodyCopy(kind: DirectoryPersonEmailKind, greetingName: string): string {
  if (kind === "added") {
    return `<p style="margin:0 0 20px;">Kia ora ${greetingName},</p>
     <p style="margin:0 0 20px;">This email confirms that your details have been added to the Ashburton Baptist Church People directory.</p>
     <p style="margin:0 0 20px;">The church uses this directory for ministry lists, rosters, and church records. If anything here does not look right, please contact the church office and we will be glad to help.</p>
     <p style="margin:0 0 20px;">You can reach us at <a href="mailto:${OFFICE_EMAIL}" style="color:#222222;font-weight:bold;">${OFFICE_EMAIL}</a>.</p>
     <p style="margin:0;font-size:13px;color:#999999;">God bless you.</p>`;
  }
  if (kind === "archived") {
    return `<p style="margin:0 0 20px;">Kia ora ${greetingName},</p>
     <p style="margin:0 0 20px;">This email confirms that your record in the Ashburton Baptist Church People directory has been archived.</p>
     <p style="margin:0 0 20px;">Your details are no longer shown on public pages, member People lists, or rosters. Church administrators can restore the record later if needed.</p>
     <p style="margin:0 0 20px;">If you have questions, please contact the church office at <a href="mailto:${OFFICE_EMAIL}" style="color:#222222;font-weight:bold;">${OFFICE_EMAIL}</a>.</p>
     <p style="margin:0;font-size:13px;color:#999999;">God bless you.</p>`;
  }
  return `<p style="margin:0 0 20px;">Kia ora ${greetingName},</p>
     <p style="margin:0 0 20px;">This email confirms that your record has been permanently removed from the Ashburton Baptist Church People directory.</p>
     <p style="margin:0 0 20px;">Your details will no longer appear on church lists, rosters, or public pages. This directory action cannot be undone.</p>
     <p style="margin:0 0 20px;">If this was unexpected, or you would like to speak with us, please contact the church office at <a href="mailto:${OFFICE_EMAIL}" style="color:#222222;font-weight:bold;">${OFFICE_EMAIL}</a>.</p>
     <p style="margin:0;font-size:13px;color:#999999;">God bless you.</p>`;
}

export function buildDirectoryPersonEmailHtml(
  kind: DirectoryPersonEmailKind,
  firstName: string,
): string {
  const greetingName = escapeHtml(firstName || "there");
  const heading =
    kind === "added"
      ? "Added to the directory"
      : kind === "archived"
        ? "Directory record archived"
        : "Directory record removed";
  return emailShell(
    directoryPersonEmailSubject(kind),
    heading,
    bodyCopy(kind, greetingName),
  );
}

export function buildDirectoryPersonEmailText(
  kind: DirectoryPersonEmailKind,
  firstName: string,
): string {
  const greetingName = firstName || "there";
  const office = OFFICE_EMAIL;
  if (kind === "added") {
    return [
      `Kia ora ${greetingName},`,
      "",
      "This email confirms that your details have been added to the Ashburton Baptist Church People directory.",
      "",
      "The church uses this directory for ministry lists, rosters, and church records. If anything here does not look right, please contact the church office and we will be glad to help.",
      "",
      `You can reach us at ${office}.`,
      "",
      "God bless you.",
      "Ashburton Baptist Church",
    ].join("\n");
  }
  if (kind === "archived") {
    return [
      `Kia ora ${greetingName},`,
      "",
      "This email confirms that your record in the Ashburton Baptist Church People directory has been archived.",
      "",
      "Your details are no longer shown on public pages, member People lists, or rosters. Church administrators can restore the record later if needed.",
      "",
      `If you have questions, please contact the church office at ${office}.`,
      "",
      "God bless you.",
      "Ashburton Baptist Church",
    ].join("\n");
  }
  return [
    `Kia ora ${greetingName},`,
    "",
    "This email confirms that your record has been permanently removed from the Ashburton Baptist Church People directory.",
    "",
    "Your details will no longer appear on church lists, rosters, or public pages. This directory action cannot be undone.",
    "",
    `If this was unexpected, or you would like to speak with us, please contact the church office at ${office}.`,
    "",
    "God bless you.",
    "Ashburton Baptist Church",
  ].join("\n");
}
