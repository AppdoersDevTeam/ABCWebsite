# Branded Auth Emails for Ashburton Baptist Church

Supabase’s default emails are sent from Supabase and look generic. To make signup confirmation (and password reset) emails look like they came from the church website, you need **two things** in the Supabase dashboard:

1. **Custom SMTP** — so the sender is `Ashburton Baptist Church <office@ashburtonbaptist.co.nz>`
2. **Custom email templates** — church branding, copy, and colours

The website code already sets the correct redirect URL after confirmation (`/#/auth/callback`). The remaining work is in Supabase.

---

## Step 1: Set Site URL and redirect URLs

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Go to **Authentication** → **URL Configuration**
3. Set **Site URL** to:
   ```
   https://www.ashburtonbaptist.co.nz
   ```
4. Add these **Redirect URLs**:
   ```
   https://www.ashburtonbaptist.co.nz/#/auth/callback
   https://www.ashburtonbaptist.co.nz/#/reset-password
   https://ashburtonbaptistchurch.vercel.app/#/auth/callback
   https://ashburtonbaptistchurch.vercel.app/#/reset-password
   http://localhost:5173/#/auth/callback
   http://localhost:5173/#/reset-password
   ```
5. Save

Also set `VITE_SITE_URL` in Vercel to `https://www.ashburtonbaptist.co.nz` (no trailing slash) and redeploy.

---

## Step 2: Configure custom SMTP with Google Workspace

Without custom SMTP, emails will keep showing **Supabase** as the sender. Since the church uses **Google Workspace**, send auth emails through `office@ashburtonbaptist.co.nz`.

### 2a. Create a Google App Password

Supabase cannot use your normal Google password. You need an **App Password** for the sending account.

1. Sign in to Google as `office@ashburtonbaptist.co.nz` (or whichever Workspace account will send these emails)
2. Turn on **2-Step Verification** for that account if it is not already on:
   - [Google Account → Security → 2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification)
3. Create an App Password:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - If you do not see this option, 2-Step Verification may not be enabled, or your Workspace admin may need to allow it
4. App name: `Supabase Website Auth`
5. Click **Create**
6. Copy the **16-character password** (e.g. `abcd efgh ijkl mnop`) — you will only see it once

**Workspace admin note:** If App Passwords are disabled org-wide, a Google Workspace admin must enable them under **Admin console → Security → Authentication → Less secure apps / App passwords** (wording varies by admin console version).

### 2b. Enter SMTP settings in Supabase

1. Supabase Dashboard → **Authentication** → **SMTP Settings**
   - (In some dashboards: **Project Settings** → **Authentication** → **SMTP**)
2. Enable **Custom SMTP**
3. Enter:

   | Field | Value |
   |-------|-------|
   | Host | `smtp.gmail.com` |
   | Port | `587` |
   | Username | `office@ashburtonbaptist.co.nz` |
   | Password | The 16-character App Password (spaces optional) |
   | Sender email | `office@ashburtonbaptist.co.nz` |
   | Sender name | `Ashburton Baptist Church` |

4. Save
5. Use **Send test email** in Supabase if available, or sign up on the site to test

**If port 587 fails**, try port `465` with SSL instead.

### 2c. Google Workspace sending limits

- Google Workspace allows roughly **2,000 emails per day** per user — more than enough for member signups
- All emails send from the real church address, so they should pass SPF/DKIM checks automatically (Google handles this for Workspace domains)

### Alternative — Resend or other SMTP

If App Passwords are not an option, use a transactional provider like [Resend](https://resend.com) with verified domain DNS instead. See the Resend section at the bottom of this file.

---

## Step 3: Customise the Confirm signup email

1. Go to **Authentication** → **Email Templates**
2. Open **Confirm signup**
3. Set **Subject** to:
   ```
   Welcome! One quick step to join our member community
   ```
4. Replace the body with the HTML below (Supabase uses `{{ .ConfirmationURL }}` for the button link)

```html
<!DOCTYPE html>
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
              <img src="https://ashburtonbaptistchurch.vercel.app/ABC%20Logo.png" alt="Ashburton Baptist Church" width="110" style="display:block;margin:0 auto 20px;border:0;" />
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
</html>
```

5. Save

### Or apply automatically with a script

The Supabase MCP plugin can list your project but **cannot** edit email templates directly. To push templates from this repo:

1. Create a **Personal Access Token** at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) with **auth config write** permission
2. Run from the `ABCWebsite` folder:

```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_your_token_here"
node tools/update-supabase-email-templates.mjs
```

This updates **Confirm signup** and **Reset password** templates to match Step 3 and Step 4 below.

---

## Step 4: Customise the Reset password email (optional but recommended)

Use matching branding for **Reset password** so forgot-password emails also look legitimate.

**Subject:**
```
Need to reset your password? We've got you
```

**Body:** Use the HTML below (uses `{{ .ConfirmationURL }}` for the reset link).

```html
<!DOCTYPE html>
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
              <img src="https://ashburtonbaptistchurch.vercel.app/ABC%20Logo.png" alt="Ashburton Baptist Church" width="110" style="display:block;margin:0 auto 20px;border:0;" />
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
</html>
```

---

## Step 5: Test

1. Delete any test user you created earlier (or use a fresh email address)
2. Sign up again on the website
3. Check the inbox — the email should show:
   - **From:** Ashburton Baptist Church `<office@ashburtonbaptist.co.nz>`
   - Church logo, colours, and copy matching the site
4. Click **Confirm my email** — you should land on the site and be able to sign in

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Still says “from Supabase” | Custom SMTP not enabled or not saved |
| Email not delivered | Check Supabase **Authentication** → **Logs**; verify App Password is correct |
| SMTP auth failed | Use App Password, not normal Google password; confirm 2-Step Verification is on |
| App Passwords missing | Workspace admin may need to allow App Passwords for the org |
| Link goes to wrong site | Site URL and `VITE_SITE_URL` must match production domain |
| Sign up again, no email | Supabase does not resend on duplicate signup — use **Resend confirmation email** on the login page (the app now does this automatically for unconfirmed accounts) |
| “Success” but no email arrives | Supabase may rate-limit auth emails (default was **2 per hour** per project). Check **Authentication → Rate Limits** and increase **Email sent**; also verify custom SMTP in **Authentication → Emails → SMTP** |
| Logo doesn’t show | Logo must be publicly reachable at `https://ashburtonbaptistchurch.vercel.app/ABC%20Logo.png` |
| Lands in spam | Emails from Google Workspace usually deliver well; check the custom HTML template is saved |

---

## Alternative: Resend SMTP

If Google App Passwords are not available:

1. Create an account at [resend.com](https://resend.com)
2. Verify domain **`ashburtonbaptist.co.nz`**
3. In Supabase SMTP settings:

   | Field | Value |
   |-------|-------|
   | Host | `smtp.resend.com` |
   | Port | `465` or `587` |
   | Username | `resend` |
   | Password | Resend API key |
   | Sender email | `office@ashburtonbaptist.co.nz` |
   | Sender name | `Ashburton Baptist Church` |

---

## Notes

- Default Supabase email is for testing only (rate-limited, generic branding).
- Production sites should always use custom SMTP on the church domain.
- Template variables are documented in Supabase: [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates).
