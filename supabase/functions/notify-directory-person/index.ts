import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { recordEmailSend, resendIdFromBody } from "./recordEmailSend.ts";
import { assertEmailQuota } from "./emailQuota.ts";
import {
  buildDirectoryPersonEmailHtml,
  buildDirectoryPersonEmailText,
  directoryPersonEmailSubject,
  firstNameFromDirectoryName,
  type DirectoryPersonEmailKind,
} from "./directoryPersonEmail.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "devteam@appdoers.co.nz";
const DEFAULT_FROM =
  "Ashburton Baptist Church <office@ashburtonbaptist.co.nz>";

type NotifyBody = {
  kind?: DirectoryPersonEmailKind;
  email?: string;
  name?: string;
  teamMemberId?: string;
  userId?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseKind(value: unknown): DirectoryPersonEmailKind | null {
  if (value === "added" || value === "archived" || value === "deleted") return value;
  return null;
}

function templateKeyFor(kind: DirectoryPersonEmailKind): string {
  if (kind === "added") return "directory_added";
  if (kind === "archived") return "directory_archived";
  return "directory_deleted";
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

    if (!isAdmin) {
      return jsonResponse({ error: "Only an admin can send directory emails." }, 403);
    }

    let body: NotifyBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const kind = parseKind(body.kind);
    if (!kind) {
      return jsonResponse({ error: "kind must be added, archived, or deleted" }, 400);
    }

    const toEmail = String(body.email || "").trim();
    const name = String(body.name || "").trim();
    if (!toEmail || !toEmail.includes("@")) {
      return jsonResponse({ error: "A valid email is required" }, 400);
    }
    if (!name) {
      return jsonResponse({ error: "name is required" }, 400);
    }

    const firstName = firstNameFromDirectoryName(name);
    const subject = directoryPersonEmailSubject(kind);
    const html = buildDirectoryPersonEmailHtml(kind, firstName);
    const text = buildDirectoryPersonEmailText(kind, firstName);

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
        text,
      }),
    });
    const resendBody = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      console.error("Resend error", resendRes.status, resendBody);
      return jsonResponse({ error: "Failed to send email", details: resendBody }, 502);
    }

    await recordEmailSend(adminClient, {
      recipientEmail: toEmail,
      recipientUserId: body.userId || null,
      templateKey: templateKeyFor(kind),
      subject,
      resendId: resendIdFromBody(resendBody),
      actorId: caller.id,
      metadata: {
        kind,
        teamMemberId: body.teamMemberId || null,
      },
    });

    return jsonResponse({
      ok: true,
      emailed: toEmail,
      kind,
      id: resendBody?.id ?? null,
    });
  } catch (err) {
    console.error("notify-directory-person unexpected error", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
