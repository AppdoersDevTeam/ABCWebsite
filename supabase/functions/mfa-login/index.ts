import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { recordEmailSend, resendIdFromBody } from "../_shared/recordEmailSend.ts";
import {
  MFA_CODE_EXPIRY_MINUTES,
  MFA_EMAIL_SUBJECT,
  MFA_EMAIL_TEMPLATE_KEY,
  buildMfaCodeEmailHtml,
} from "../_shared/mfaEmailTemplate.ts";
import {
  RATE_LIMITS,
  consumeEmailChallenge,
  consumeRecoveryCode,
  createEmailChallenge,
  decryptText,
  encryptText,
  expiredCode,
  firstNameOf,
  genericInvalid,
  loadSettings,
  loadUser,
  markSessionVerified,
  maskEmail,
  methodsOf,
  mfaEnabled,
  publicError,
  sessionIdFromJwt,
  tooMany,
  verifyStoredTotp,
  writeAudit,
  checkRateLimit,
  type AdminClient,
  type UserRow,
} from "../_shared/mfaService.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_FROM =
  "Ashburton Baptist Church <office@ashburtonbaptist.co.nz>";
const DEFAULT_SITE_URL = "https://ashburtonbaptist.co.nz";

type Body = Record<string, unknown>;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fromError(err: { error: string; status: number }): Response {
  return jsonResponse({ error: err.error }, err.status);
}

function env() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  return { supabaseUrl, supabaseAnonKey, serviceRoleKey };
}

function adminClient(): AdminClient {
  const { supabaseUrl, serviceRoleKey } = env();
  return createClient(supabaseUrl, serviceRoleKey);
}

async function checkEmailSendLimits(admin: AdminClient, userId: string) {
  const perMinute = await checkRateLimit(admin, `email_send:${userId}`, RATE_LIMITS.emailSend);
  if (!perMinute.allowed) return perMinute;
  return checkRateLimit(admin, `email_send_hour:${userId}`, RATE_LIMITS.emailSendHour);
}

async function sendMfaEmail(
  admin: AdminClient,
  profile: UserRow,
  code: string,
  actorId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const toEmail = (profile.email || "").trim();
  if (!resendApiKey) return { ok: false, error: "Email service not configured" };
  if (!toEmail) return { ok: false, error: "User has no email" };

  const siteUrl = (Deno.env.get("SITE_URL") || DEFAULT_SITE_URL).replace(/\/$/, "");
  const fromEmail = Deno.env.get("APPROVAL_FROM_EMAIL") || DEFAULT_FROM;
  const html = buildMfaCodeEmailHtml({
    firstName: firstNameOf(profile),
    code,
    expiryMinutes: MFA_CODE_EXPIRY_MINUTES,
    loginUrl: `${siteUrl}/#/login`,
  });

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: MFA_EMAIL_SUBJECT,
      html,
    }),
  });
  const resendBody = await resendRes.json().catch(() => ({}));
  if (!resendRes.ok) {
    console.error("mfa email send failed", resendRes.status);
    return { ok: false, error: "Failed to send verification email" };
  }
  await recordEmailSend(admin, {
    recipientEmail: toEmail,
    recipientUserId: profile.id,
    templateKey: MFA_EMAIL_TEMPLATE_KEY,
    subject: MFA_EMAIL_SUBJECT,
    resendId: resendIdFromBody(resendBody),
    actorId,
    metadata: { purpose: "mfa" },
  });
  return { ok: true };
}

async function passwordGrant(email: string, password: string, captchaToken: string) {
  const { supabaseUrl, supabaseAnonKey } = env();
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      gotrue_meta_security: { captcha_token: captchaToken },
    }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

function sessionPayload(body: Record<string, unknown>) {
  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_in: body.expires_in,
    expires_at: body.expires_at,
    token_type: body.token_type,
    user: body.user,
  };
}

async function handleLoginBegin(admin: AdminClient, body: Body) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const captchaToken = String(body.captchaToken || "");
  if (!email || !password) return fromError(publicError("Please enter email and password", 400));
  if (!captchaToken) return fromError(publicError("Please complete the CAPTCHA before continuing.", 400));

  const emailHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  const bucket = `login_begin:${[...new Uint8Array(emailHash)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16)}`;
  const limit = await checkRateLimit(admin, bucket, RATE_LIMITS.loginBegin);
  if (!limit.allowed) return fromError(tooMany());

  const grant = await passwordGrant(email, password, captchaToken);
  if (!grant.ok) {
    const msg = String(grant.body?.error_description || grant.body?.msg || grant.body?.error || "");
    const lower = msg.toLowerCase();
    if (lower.includes("captcha") || lower.includes("turnstile")) {
      return fromError(publicError("CAPTCHA verification failed. Please try again.", 400));
    }
    if (lower.includes("email not confirmed")) {
      return fromError(publicError("email not confirmed", 400));
    }
    await writeAudit(admin, {
      action: "login_failed",
      summary: "Failed login attempt",
      actorRole: "anonymous",
      details: { method: "email" },
    });
    return fromError(publicError("Incorrect email or password. Please try again.", 401));
  }

  const userId = grant.body?.user?.id as string | undefined;
  if (!userId || !grant.body.access_token || !grant.body.refresh_token) {
    return fromError(publicError("Login failed", 500));
  }

  const profile = await loadUser(admin, userId);
  const settings = await loadSettings(admin, userId);
  if (!mfaEnabled(settings)) {
    const sessionId = sessionIdFromJwt(String(grant.body.access_token));
    if (sessionId) {
      await markSessionVerified(admin, sessionId, userId, "setup");
    }
    await writeAudit(admin, {
      actorId: userId,
      actorEmail: profile?.email || email,
      actorRole: profile?.role === "admin" ? "admin" : "member",
      action: "login",
      summary: `${profile?.email || email} signed in with email and password`,
      entityId: userId,
      details: { method: "email", mfa: false },
    });
    return jsonResponse({ ok: true, mfaRequired: false, session: sessionPayload(grant.body) });
  }

  await admin
    .from("mfa_login_challenges")
    .update({ consumed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("consumed_at", null);

  const { data: challenge, error } = await admin
    .from("mfa_login_challenges")
    .insert({
      user_id: userId,
      access_token_enc: await encryptText(String(grant.body.access_token)),
      refresh_token_enc: await encryptText(String(grant.body.refresh_token)),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      attempt_count: 0,
      max_attempts: 8,
    })
    .select("id")
    .single();

  if (error || !challenge) {
    console.error("mfa login challenge insert failed", error?.message);
    return fromError(publicError("Login failed", 500));
  }

  return jsonResponse({
    ok: true,
    mfaRequired: true,
    challengeId: challenge.id,
    methods: methodsOf(settings),
    maskedEmail: maskEmail(profile?.email || email),
  });
}

async function loadLoginChallenge(admin: AdminClient, challengeId: string) {
  const { data } = await admin
    .from("mfa_login_challenges")
    .select("*")
    .eq("id", challengeId)
    .maybeSingle();
  return data as {
    id: string;
    user_id: string;
    access_token_enc: string;
    refresh_token_enc: string;
    expires_at: string;
    attempt_count: number;
    max_attempts: number;
    consumed_at: string | null;
  } | null;
}

async function finishLoginChallenge(
  admin: AdminClient,
  challenge: NonNullable<Awaited<ReturnType<typeof loadLoginChallenge>>>,
  method: "totp" | "email" | "recovery",
) {
  const access = await decryptText(challenge.access_token_enc);
  const refresh = await decryptText(challenge.refresh_token_enc);
  const sessionId = sessionIdFromJwt(access);
  if (sessionId) {
    await markSessionVerified(admin, sessionId, challenge.user_id, method);
  }
  await admin
    .from("mfa_login_challenges")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", challenge.id);

  const profile = await loadUser(admin, challenge.user_id);
  await writeAudit(admin, {
    actorId: challenge.user_id,
    actorEmail: profile?.email || null,
    actorRole: profile?.role === "admin" ? "admin" : "member",
    action: "login",
    summary: `${profile?.email || "user"} completed MFA and signed in`,
    entityId: challenge.user_id,
    details: { method, mfa: true },
  });

  return jsonResponse({
    ok: true,
    session: {
      access_token: access,
      refresh_token: refresh,
      token_type: "bearer",
    },
  });
}

async function bumpLoginAttempts(
  admin: AdminClient,
  challenge: NonNullable<Awaited<ReturnType<typeof loadLoginChallenge>>>,
) {
  const next = challenge.attempt_count + 1;
  await admin
    .from("mfa_login_challenges")
    .update({
      attempt_count: next,
      consumed_at: next >= challenge.max_attempts ? new Date().toISOString() : challenge.consumed_at,
    })
    .eq("id", challenge.id);
  if (next >= challenge.max_attempts) {
    const profile = await loadUser(admin, challenge.user_id);
    await writeAudit(admin, {
      actorId: challenge.user_id,
      actorEmail: profile?.email || null,
      action: "mfa_verify_lockout",
      summary: "Excessive MFA verification attempts",
      entityId: challenge.user_id,
      details: { method: "login" },
    });
  }
}

async function handleLoginSendEmail(admin: AdminClient, body: Body) {
  const challengeId = String(body.challengeId || "");
  const challenge = await loadLoginChallenge(admin, challengeId);
  if (!challenge || challenge.consumed_at) return fromError(genericInvalid());
  if (Date.parse(challenge.expires_at) <= Date.now()) return fromError(expiredCode());

  const settings = await loadSettings(admin, challenge.user_id);
  if (!settings?.email_enabled) return fromError(publicError("Forbidden", 403));

  const limit = await checkEmailSendLimits(admin, challenge.user_id);
  if (!limit.allowed) return fromError(tooMany());

  const profile = await loadUser(admin, challenge.user_id);
  if (!profile) return fromError(publicError("User not found", 404));
  const code = await createEmailChallenge(admin, challenge.user_id, "login");
  const sent = await sendMfaEmail(admin, profile, code, challenge.user_id);
  if (!sent.ok) return fromError(publicError(sent.error || "Failed to send verification email", 502));
  return jsonResponse({ ok: true, maskedEmail: maskEmail(profile.email || "") });
}

async function handleLoginVerify(admin: AdminClient, body: Body) {
  const challengeId = String(body.challengeId || "");
  const method = String(body.method || "");
  const code = String(body.code || "");
  const challenge = await loadLoginChallenge(admin, challengeId);
  if (!challenge || challenge.consumed_at) return fromError(genericInvalid());
  if (Date.parse(challenge.expires_at) <= Date.now()) return fromError(expiredCode());
  if (challenge.attempt_count >= challenge.max_attempts) return fromError(tooMany());

  const settings = await loadSettings(admin, challenge.user_id);
  if (!mfaEnabled(settings)) return fromError(publicError("Forbidden", 403));

  if (method === "totp") {
    if (!settings?.totp_enabled) return fromError(genericInvalid());
    const limit = await checkRateLimit(admin, `totp_verify:${challenge.user_id}`, RATE_LIMITS.totpVerify);
    if (!limit.allowed) return fromError(tooMany());
    const result = await verifyStoredTotp(settings, code);
    if (!result.valid) {
      await bumpLoginAttempts(admin, challenge);
      await writeAudit(admin, {
        actorId: challenge.user_id,
        action: "mfa_verify_failed",
        summary: "MFA verification failed",
        entityId: challenge.user_id,
        details: { method: "totp", replay: result.replay },
      });
      return fromError(genericInvalid());
    }
    await admin
      .from("user_mfa_settings")
      .update({
        totp_last_used_at: new Date().toISOString(),
        totp_last_timestep: result.timestep,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", challenge.user_id);
    return finishLoginChallenge(admin, challenge, "totp");
  }

  if (method === "email") {
    if (!settings?.email_enabled) return fromError(genericInvalid());
    const limit = await checkRateLimit(admin, `email_verify:${challenge.user_id}`, RATE_LIMITS.emailVerify);
    if (!limit.allowed) return fromError(tooMany());
    const consumed = await consumeEmailChallenge(admin, challenge.user_id, "login", code);
    if (!consumed.ok) {
      await bumpLoginAttempts(admin, challenge);
      await writeAudit(admin, {
        actorId: challenge.user_id,
        action: "mfa_verify_failed",
        summary: "MFA verification failed",
        entityId: challenge.user_id,
        details: { method: "email", reason: consumed.reason },
      });
      if (consumed.reason === "expired") return fromError(expiredCode());
      return fromError(genericInvalid());
    }
    await admin
      .from("user_mfa_settings")
      .update({ email_last_used_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("user_id", challenge.user_id);
    return finishLoginChallenge(admin, challenge, "email");
  }

  if (method === "recovery") {
    const limit = await checkRateLimit(admin, `recovery:${challenge.user_id}`, RATE_LIMITS.recovery);
    if (!limit.allowed) return fromError(tooMany());
    const ok = await consumeRecoveryCode(admin, challenge.user_id, code);
    if (!ok) {
      await bumpLoginAttempts(admin, challenge);
      await writeAudit(admin, {
        actorId: challenge.user_id,
        action: "mfa_verify_failed",
        summary: "MFA verification failed",
        entityId: challenge.user_id,
        details: { method: "recovery" },
      });
      return fromError(genericInvalid());
    }
    await writeAudit(admin, {
      actorId: challenge.user_id,
      action: "mfa_recovery_used",
      summary: "Recovery code used at login",
      entityId: challenge.user_id,
      details: { method: "recovery" },
    });
    return finishLoginChallenge(admin, challenge, "recovery");
  }

  return fromError(publicError("Invalid verification method.", 400));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const { supabaseUrl, supabaseAnonKey, serviceRoleKey } = env();
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const action = String(body.action || "");
  const admin = adminClient();

  try {
    switch (action) {
      case "login_begin":
        return await handleLoginBegin(admin, body);
      case "login_send_email":
        return await handleLoginSendEmail(admin, body);
      case "login_verify":
        return await handleLoginVerify(admin, body);
      default:
        return jsonResponse({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "missing_mfa_key" || message === "bad_ciphertext") {
      console.error("mfa crypto configuration error");
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }
    console.error("mfa unexpected error", message);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
