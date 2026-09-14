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
const DEFAULT_SITE_URL = "https://ashburtonbaptist.co.nz";
const LOGO_URL = "https://ashburtonbaptist.co.nz/abc-logo.png";

type DeleteBody = {
  userId?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildDeletedEmailHtml(firstName: string): string {
  const greetingName = firstName || "there";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your account has been removed</title>
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
              <h1 style="margin:0 0 12px;font-size:28px;line-height:1.25;color:#222222;font-weight:normal;">Account removed</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#666666;font-style:italic;">Disciples of Jesus impacting Ashburton and the nations.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#444444;">
              <p style="margin:0 0 20px;">Kia ora ${greetingName},</p>
              <p style="margin:0 0 20px;">This email confirms that your account has been deleted from the Ashburton Baptist Church system. Your login and related website records have been removed.</p>
              <p style="margin:0 0 20px;">If this was unexpected, or you would like to be part of the church website again, please contact the church office.</p>
              <p style="margin:0;font-size:13px;color:#999999;">You will no longer be able to sign in with this account.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 32px;background-color:#222222;text-align:center;">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#fbcb05;">Ashburton Baptist Church</p>
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#cccccc;">284 Havelock Street, Ashburton 7700</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
                <a href="mailto:office@ashburtonbaptist.co.nz" style="color:#ffffff;text-decoration:none;">office@ashburtonbaptist.co.nz</a>
                &nbsp;&middot;&nbsp;
                <a href="${DEFAULT_SITE_URL}" style="color:#ffffff;text-decoration:none;">ashburtonbaptist.co.nz</a>
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

async function ignoreMissingTable(
  result: PromiseLike<{ error: { message?: string; code?: string } | null }>,
  label: string,
) {
  const { error } = await result;
  if (!error) return;
  const code = error.code || "";
  const message = (error.message || "").toLowerCase();
  if (
    code === "42P01" ||
    code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("could not find the table")
  ) {
    console.warn(`delete-user: skipped missing ${label}`);
    return;
  }
  console.warn(`delete-user: ${label} cleanup warning`, error);
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
      (callerProfile?.role === "admin" && callerProfile?.is_approved === true) ||
      callerProfile?.is_super_admin === true;

    if (!isAdmin) {
      return jsonResponse({ error: "Only an admin can delete users." }, 403);
    }

    let body: DeleteBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const userId = body.userId?.trim();
    if (!userId) {
      return jsonResponse({ error: "userId is required" }, 400);
    }

    if (userId === caller.id) {
      return jsonResponse(
        { error: "You cannot delete your own account while you are logged in." },
        403,
      );
    }

    const { data: target, error: targetError } = await adminClient
      .from("users")
      .select("id, email, first_name, name, role, is_super_admin, is_approved")
      .eq("id", userId)
      .maybeSingle();

    if (targetError) {
      console.error("Target user lookup failed", targetError);
      return jsonResponse({ error: "Failed to load user" }, 500);
    }

    if (!target) {
      return jsonResponse({ error: "User not found" }, 404);
    }

    const targetEmail = (target.email || "").trim().toLowerCase();
    if (target.is_super_admin === true || targetEmail === ADMIN_EMAIL.toLowerCase()) {
      return jsonResponse({ error: "This account cannot be deleted." }, 403);
    }

    const firstName =
      (target.first_name || "").trim() ||
      (target.name || "").trim().split(/\s+/)[0] ||
      "";

    await ignoreMissingTable(
      adminClient.from("prayer_counts").delete().eq("user_id", userId),
      "prayer_counts",
    );
    await ignoreMissingTable(
      adminClient.from("prayer_requests").delete().eq("user_id", userId),
      "prayer_requests",
    );
    await ignoreMissingTable(
      adminClient.from("team_members").update({ user_id: null }).eq("user_id", userId),
      "team_members",
    );
    await ignoreMissingTable(
      adminClient.from("audit_logs").update({ actor_id: null }).eq("actor_id", userId),
      "audit_logs",
    );
    if (targetEmail) {
      await ignoreMissingTable(
        adminClient.from("event_rsvps").delete().ilike("email", targetEmail),
        "event_rsvps",
      );
    }

    const { error: deleteProfileError } = await adminClient
      .from("users")
      .delete()
      .eq("id", userId);

    if (deleteProfileError) {
      console.error("Failed to delete public.users", deleteProfileError);
      return jsonResponse({ error: "Failed to delete user profile" }, 500);
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Failed to delete auth user", deleteAuthError);
      return jsonResponse(
        {
          error:
            "Profile was removed, but the login account could not be deleted. Please try again or contact support.",
        },
        500,
      );
    }

    let emailed: string | null = null;
    let emailSkipped = false;
    const toEmail = (target.email || "").trim();

    if (!toEmail) {
      emailSkipped = true;
    } else if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY");
      emailSkipped = true;
    } else {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: "Your Ashburton Baptist Church account has been deleted",
          html: buildDeletedEmailHtml(firstName),
        }),
      });
      const resendBody = await resendRes.json().catch(() => ({}));
      if (!resendRes.ok) {
        console.error("Resend error", resendRes.status, resendBody);
        emailSkipped = true;
      } else {
        emailed = toEmail;
      }
    }

    return jsonResponse({
      ok: true,
      emailed,
      emailSkipped,
    });
  } catch (err) {
    console.error("delete-user unexpected error", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
