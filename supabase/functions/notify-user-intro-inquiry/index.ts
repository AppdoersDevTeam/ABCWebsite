import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "devteam@appdoers.co.nz";
const DEFAULT_FROM =
  "Ashburton Baptist Church <office@ashburtonbaptist.co.nz>";
const REPLY_TO = "office@ashburtonbaptist.co.nz";
const LOGO_URL = "https://ashburtonbaptist.co.nz/abc-logo.png";
const MAX_SUBJECT_LEN = 200;
const MAX_BODY_LEN = 10000;

type NotifyBody = {
  userId?: string;
  subject?: string;
  body?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Convert plain-text body (with blank-line paragraphs and - list lines) to safe HTML. */
function plainTextToEmailHtml(plain: string): string {
  const blocks = plain.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  const parts: string[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trimEnd());
    const isList = lines.every((l) => !l.trim() || /^[-•*]\s+/.test(l.trim()));

    if (isList && lines.some((l) => l.trim())) {
      const items = lines
        .filter((l) => l.trim())
        .map((l) => {
          const item = l.trim().replace(/^[-•*]\s+/, "");
          return `<li style="margin:0 0 8px;">${escapeHtml(item)}</li>`;
        })
        .join("");
      parts.push(
        `<ul style="margin:0 0 20px;padding-left:22px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#444444;">${items}</ul>`,
      );
    } else {
      const html = lines
        .map((l) => escapeHtml(l))
        .join("<br />");
      parts.push(
        `<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#444444;">${html}</p>`,
      );
    }
  }

  return parts.join("");
}

function buildIntroEmailHtml(params: { bodyHtml: string }): string {
  const { bodyHtml } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hello from Ashburton Baptist Church</title>
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
              <h1 style="margin:0 0 12px;font-size:28px;line-height:1.25;color:#222222;font-weight:normal;">A quick hello</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#666666;font-style:italic;">Disciples of Jesus impacting Ashburton and the nations.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 28px;">
              ${bodyHtml}
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
        <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#ffffff;opacity:0.85;">Sent from the church office. Reply to this email to reach us.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
      console.error("Missing Supabase environment variables");
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY");
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

    const { data: callerProfile, error: callerProfileError } = await adminClient
      .from("users")
      .select("id, email, role, is_super_admin, is_approved")
      .eq("id", caller.id)
      .maybeSingle();

    if (callerProfileError) {
      console.error("Caller profile lookup failed", callerProfileError);
      return jsonResponse({ error: "Failed to verify admin" }, 500);
    }

    const callerEmail = (callerProfile?.email || caller.email || "")
      .trim()
      .toLowerCase();
    const isAdmin =
      callerEmail === ADMIN_EMAIL.toLowerCase() ||
      callerProfile?.role === "admin" ||
      callerProfile?.is_super_admin === true;

    if (!isAdmin) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    let body: NotifyBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const userId = body.userId?.trim();
    const subject = (body.subject || "").trim();
    const messageBody = (body.body || "").trim();

    if (!userId) {
      return jsonResponse({ error: "userId is required" }, 400);
    }
    if (!subject) {
      return jsonResponse({ error: "subject is required" }, 400);
    }
    if (!messageBody) {
      return jsonResponse({ error: "body is required" }, 400);
    }
    if (subject.length > MAX_SUBJECT_LEN) {
      return jsonResponse({ error: "subject is too long" }, 400);
    }
    if (messageBody.length > MAX_BODY_LEN) {
      return jsonResponse({ error: "body is too long" }, 400);
    }

    const { data: target, error: targetError } = await adminClient
      .from("users")
      .select("id, email, first_name, name")
      .eq("id", userId)
      .maybeSingle();

    if (targetError) {
      console.error("Target user lookup failed", targetError);
      return jsonResponse({ error: "Failed to load user" }, 500);
    }

    if (!target) {
      return jsonResponse({ error: "User not found" }, 404);
    }

    const toEmail = (target.email || "").trim();
    if (!toEmail) {
      return jsonResponse({ error: "User has no email" }, 400);
    }

    const bodyHtml = plainTextToEmailHtml(messageBody);
    const html = buildIntroEmailHtml({ bodyHtml });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        reply_to: REPLY_TO,
        to: [toEmail],
        subject,
        html,
        text: messageBody,
      }),
    });

    const resendBody = await resendRes.json().catch(() => ({}));

    if (!resendRes.ok) {
      console.error("Resend error", resendRes.status, resendBody);
      return jsonResponse(
        {
          error: "Failed to send intro email",
          details: resendBody,
        },
        502,
      );
    }

    return jsonResponse({
      ok: true,
      emailed: toEmail,
      id: resendBody?.id ?? null,
    });
  } catch (err) {
    console.error("notify-user-intro-inquiry unexpected error", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
