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
   Confirm your Ashburton Baptist Church member account
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
<body style="margin:0;padding:0;background-color:#A8B774;font-family:Arial,Helvetica,sans-serif;color:#222222;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#A8B774;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:32px 32px 16px;text-align:center;background-color:#ffffff;">
              <img src="https://www.ashburtonbaptist.co.nz/ABC%20Logo.png" alt="Ashburton Baptist Church" width="120" style="display:block;margin:0 auto 16px;border:0;" />
              <h1 style="margin:0;font-size:24px;line-height:1.3;color:#222222;font-weight:normal;">Welcome to Ashburton Baptist Church</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;font-size:16px;line-height:1.6;color:#444444;">
              <p style="margin:0 0 16px;">Thanks for creating a member account on our website.</p>
              <p style="margin:0 0 24px;">Please confirm your email address so we know this account belongs to you. After confirming, you can sign in and wait for admin approval to access the member area.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#fbcb05;">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:bold;color:#222222;text-decoration:none;">Confirm my email</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:14px;color:#808080;">If the button doesn’t work, copy and paste this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:14px;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#222222;">{{ .ConfirmationURL }}</a></p>
              <p style="margin:0;font-size:14px;color:#808080;">If you didn’t sign up on the Ashburton Baptist Church website, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #eeeeee;font-size:13px;line-height:1.5;color:#808080;text-align:center;">
              <strong style="color:#222222;">Ashburton Baptist Church</strong><br />
              284 Havelock Street, Ashburton 7700<br />
              <a href="mailto:office@ashburtonbaptist.co.nz" style="color:#222222;">office@ashburtonbaptist.co.nz</a><br />
              <a href="https://www.ashburtonbaptist.co.nz" style="color:#222222;">www.ashburtonbaptist.co.nz</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

5. Save

---

## Step 4: Customise the Reset password email (optional but recommended)

Use the same branding for **Reset password** so forgot-password emails also look legitimate.

**Subject:**
```
Reset your Ashburton Baptist Church password
```

**Body:** Same HTML as above, but change the heading to “Reset your password”, the intro text to mention password reset, and replace `{{ .ConfirmationURL }}` with the reset link variable Supabase provides in that template (usually also `{{ .ConfirmationURL }}` for recovery emails).

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
| Logo doesn’t show | Logo must be publicly reachable at `https://www.ashburtonbaptist.co.nz/ABC%20Logo.png` |
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
