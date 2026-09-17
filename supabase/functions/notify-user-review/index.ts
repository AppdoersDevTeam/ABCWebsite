import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { recordEmailSend, resendIdFromBody } from "./recordEmailSend.ts";
import { assertEmailQuota } from "../_shared/emailQuota.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "devteam@appdoers.co.nz";
const OFFICE_EMAIL = "office@ashburtonbaptist.co.nz";
const DEFAULT_FROM =
  "Ashburton Baptist Church <office@ashburtonbaptist.co.nz>";
const LOGO_URL = "https://ashburtonbaptist.co.nz/abc-logo.png";
const SITE_URL = "https://ashburtonbaptist.co.nz";

type ReviewKind = "received" | "denied";

type NotifyBody = {
  userId?: string;
  kind?: ReviewKind;
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loginPageFooterHtml(loginUrl: string): string {
  return `<div style="margin:28px 0 0;padding-top:20px;border-top:1px solid #eeeeee;">
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#444444;">
                You can open the website Log in page here:
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

function buildReceivedEmailHtml(firstName: string): string {
  const greetingName = escapeHtml(firstName) || "there";
  return emailShell(
    "We have received your signup",
    "Signup received",
    `<p style="margin:0 0 20px;">Kia ora ${greetingName},</p>
     <p style="margin:0 0 20px;">Thank you for signing up. Your account has been received and is now under review by our Admin Team.</p>
     <p style="margin:0 0 20px;">This may take up to 48 hours. The team will work as quickly as possible to give you feedback before then.</p>
     <p style="margin:0 0 20px;">You will receive another email once the review is complete &mdash; whether your account is approved or not.</p>
     <p style="margin:0;font-size:13px;color:#999999;">If you did not create this account, you can safely ignore this email.</p>`,
  );
}

function buildDeniedEmailHtml(firstName: string): string {
  const greetingName = escapeHtml(firstName) || "there";
  return emailShell(
    "Your signup was not approved",
    "Signup not approved",
    `<p style="margin:0 0 20px;">Kia ora ${greetingName},</p>
     <p style="margin:0 0 20px;">The Admin Team has reviewed your request and has not approved access to the Ashburton Baptist Church website at this time.</p>
     <p style="margin:0 0 20px;">If you have questions, please contact the Office on <a href="mailto:${OFFICE_EMAIL}" style="color:#222222;font-weight:bold;">${OFFICE_EMAIL}</a>.</p>
     <p style="margin:0;font-size:13px;color:#999999;">God bless you.</p>`,
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("APPROVAL_FROM_EMAIL") || DEFAULT_FROM;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }
    if (!resendApiKey) {
      return jsonResponse({ error: "Email service not configured" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization" }, 401);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user: caller },
      error: callerError,
    } = await userClient.auth.getUser();

    if (callerError || !caller) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerProfile } = await adminClient
      .from("users")
      .select("id, email, role, is_super_admin, is_approved")
      .eq("id", caller.id)
      .maybeSingle();

    const callerEmail = (callerProfile?.email || caller.email || "")
      .trim()
      .toLowerCase();
    const isAdmin =
      callerEmail === ADMIN_EMAIL.toLowerCase() ||
      (callerProfile?.role === "admin" && callerProfile?.is_approved === true) ||
      callerProfile?.is_super_admin === true;

    let body: NotifyBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const kind: ReviewKind = body.kind === "denied" ? "denied" : "received";
    const userId = (body.userId || caller.id).trim();
    if (!userId) {
      return jsonResponse({ error: "userId is required" }, 400);
    }

    if (kind === "denied" && !isAdmin) {
      return jsonResponse({ error: "Only an admin can send a denial email." }, 403);
    }
    if (kind === "received" && !isAdmin && userId !== caller.id) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const { data: target, error: targetError } = await adminClient
      .from("users")
      .select("id, email, first_name, name, is_approved")
      .eq("id", userId)
      .maybeSingle();

    if (targetError || !target) {
      return jsonResponse({ error: "User not found" }, 404);
    }

    if (kind === "received" && target.is_approved) {
      return jsonResponse({ ok: true, skipped: true, reason: "already_approved" });
    }

    const toEmail = (target.email || "").trim();
    if (!toEmail) {
      return jsonResponse({ error: "User has no email" }, 400);
    }

    const firstName =
      (target.first_name || "").trim() ||
      (target.name || "").trim().split(/\s+/)[0] ||
      "";

    const html =
      kind === "denied"
        ? buildDeniedEmailHtml(firstName)
        : buildReceivedEmailHtml(firstName);
    const subject =
      kind === "denied"
        ? "Your Ashburton Baptist Church signup was not approved"
        : "We have received your Ashburton Baptist Church signup";

    const quota = await assertEmailQuota(adminClient);
    if (!quota.ok) {
      return jsonResponse({ error: quota.error, code: "email_quota" }, 429);
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
      }),
    });
    const resendBody = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      console.error("Resend error", resendRes.status, resendBody);
      return jsonResponse({ error: "Failed to send email", details: resendBody }, 502);
    }

    await recordEmailSend(adminClient, {
      recipientEmail: toEmail,
      recipientUserId: target.id,
      templateKey: kind === "denied" ? "denial" : "signup_received",
      subject,
      resendId: resendIdFromBody(resendBody),
      actorId: caller.id,
    });

    return jsonResponse({ ok: true, emailed: toEmail, kind, id: resendBody?.id ?? null });
  } catch (err) {
    console.error("notify-user-review unexpected error", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
