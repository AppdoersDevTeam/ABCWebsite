import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { recordEmailSend, resendIdFromBody } from "./recordEmailSend.ts";
import {
  MFA_CODE_EXPIRY_MINUTES,
  MFA_EMAIL_SUBJECT,
  MFA_EMAIL_TEMPLATE_KEY,
  buildMfaCodeEmailHtml,
} from "./mfaEmailTemplate.ts";
import {
  RATE_LIMITS,
  consumeEmailChallenge,
  consumeRecoveryCode,
  createEmailChallenge,
  decryptText,
  encryptText,
  ensureSettings,
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
  replaceRecoveryCodes,
  sessionIdFromJwt,
  startTotpEnroll,
  tooMany,
  verifyStoredTotp,
  writeAudit,
  checkRateLimit,
  isEligibleForSetup,
  hasPasswordProvider,
  type AdminClient,
  type UserRow,
} from "./mfaService.ts";

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

async function callerFromRequest(req: Request) {
  const { supabaseUrl, supabaseAnonKey } = env();
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "");
  return { user, token, sessionId: sessionIdFromJwt(token) };
}

async function requireApprovedCaller(req: Request, admin: AdminClient) {
  const caller = await callerFromRequest(req);
  if (!caller) return { error: publicError("Unauthorized", 401) };
  const profile = await loadUser(admin, caller.user.id);
  if (!profile) return { error: publicError("Unauthorized", 401) };
  if (!isEligibleForSetup(profile)) {
    return { error: publicError("Forbidden", 403) };
  }
  return { caller, profile };
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

function statusPayload(
  profile: UserRow,
  settings: Awaited<ReturnType<typeof loadSettings>>,
  hasPassword: boolean,
) {
  const methods = methodsOf(settings);
  return {
    totpEnabled: Boolean(settings?.totp_enabled),
    emailEnabled: Boolean(settings?.email_enabled),
    mfaEnabled: mfaEnabled(settings),
    totpPending: Boolean(settings?.totp_pending_secret_enc),
    recoveryRemaining: settings?.recovery_remaining ?? 0,
    recoveryGeneratedAt: settings?.recovery_generated_at ?? null,
    maskedEmail: maskEmail(profile.email || ""),
    methods,
    hasPasswordProvider: hasPassword,
  };
}

async function lookupHasPasswordProvider(admin: AdminClient, userId: string): Promise<boolean> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data?.user) return true;
  return hasPasswordProvider({
    identities: data.user.identities,
    providers: data.user.app_metadata?.providers,
  });
}

async function handleSessionStatus(req: Request, admin: AdminClient) {
  const caller = await callerFromRequest(req);
  if (!caller) return fromError(publicError("Unauthorized", 401));
  const profile = await loadUser(admin, caller.user.id);
  if (!profile) return fromError(publicError("Unauthorized", 401));
  const settings = await loadSettings(admin, caller.user.id);
  const enabled = mfaEnabled(settings);
  let verified = true;
  if (enabled) {
    if (!caller.sessionId) verified = false;
    else {
      const { data } = await admin
        .from("mfa_verified_sessions")
        .select("session_id")
        .eq("session_id", caller.sessionId)
        .eq("user_id", caller.user.id)
        .is("revoked_at", null)
        .maybeSingle();
      verified = Boolean(data);
    }
  }
  return jsonResponse({
    ok: true,
    mfaRequired: enabled && !verified,
    methods: methodsOf(settings),
    maskedEmail: maskEmail(profile.email || caller.user.email || ""),
    approved: isEligibleForSetup(profile),
    user: profile,
  });
}

async function handleSessionVerify(req: Request, admin: AdminClient, body: Body) {
  const caller = await callerFromRequest(req);
  if (!caller || !caller.sessionId) return fromError(publicError("Unauthorized", 401));
  const settings = await loadSettings(admin, caller.user.id);
  if (!mfaEnabled(settings)) {
    await markSessionVerified(admin, caller.sessionId, caller.user.id, "setup");
    return jsonResponse({ ok: true });
  }
  const method = String(body.method || "");
  const code = String(body.code || "");

  if (method === "totp") {
    if (!settings?.totp_enabled) return fromError(genericInvalid());
    const limit = await checkRateLimit(admin, `totp_verify:${caller.user.id}`, RATE_LIMITS.totpVerify);
    if (!limit.allowed) return fromError(tooMany());
    const result = await verifyStoredTotp(settings, code);
    if (!result.valid) {
      await writeAudit(admin, {
        actorId: caller.user.id,
        action: "mfa_verify_failed",
        summary: "MFA verification failed",
        entityId: caller.user.id,
        details: { method: "totp" },
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
      .eq("user_id", caller.user.id);
    await markSessionVerified(admin, caller.sessionId, caller.user.id, "totp");
    return jsonResponse({ ok: true });
  }

  if (method === "email") {
    if (!settings?.email_enabled) return fromError(genericInvalid());
    const limit = await checkRateLimit(admin, `email_verify:${caller.user.id}`, RATE_LIMITS.emailVerify);
    if (!limit.allowed) return fromError(tooMany());
    const consumed = await consumeEmailChallenge(admin, caller.user.id, "login", code);
    if (!consumed.ok) {
      return fromError(consumed.reason === "expired" ? expiredCode() : genericInvalid());
    }
    await markSessionVerified(admin, caller.sessionId, caller.user.id, "email");
    return jsonResponse({ ok: true });
  }

  if (method === "recovery") {
    const limit = await checkRateLimit(admin, `recovery:${caller.user.id}`, RATE_LIMITS.recovery);
    if (!limit.allowed) return fromError(tooMany());
    const ok = await consumeRecoveryCode(admin, caller.user.id, code);
    if (!ok) return fromError(genericInvalid());
    await markSessionVerified(admin, caller.sessionId, caller.user.id, "recovery");
    await writeAudit(admin, {
      actorId: caller.user.id,
      action: "mfa_recovery_used",
      summary: "Recovery code used",
      entityId: caller.user.id,
    });
    return jsonResponse({ ok: true });
  }

  return fromError(publicError("Invalid verification method.", 400));
}

async function handleSessionSendEmail(req: Request, admin: AdminClient) {
  const caller = await callerFromRequest(req);
  if (!caller) return fromError(publicError("Unauthorized", 401));
  const settings = await loadSettings(admin, caller.user.id);
  if (!settings?.email_enabled) return fromError(publicError("Forbidden", 403));
  const limit = await checkEmailSendLimits(admin, caller.user.id);
  if (!limit.allowed) return fromError(tooMany());
  const profile = await loadUser(admin, caller.user.id);
  if (!profile) return fromError(publicError("User not found", 404));
  const code = await createEmailChallenge(admin, caller.user.id, "login");
  const sent = await sendMfaEmail(admin, profile, code, caller.user.id);
  if (!sent.ok) return fromError(publicError(sent.error || "Failed to send verification email", 502));
  return jsonResponse({ ok: true, maskedEmail: maskEmail(profile.email || "") });
}

async function handleStatus(req: Request, admin: AdminClient) {
  const authz = await requireApprovedCaller(req, admin);
  if ("error" in authz && authz.error) return fromError(authz.error);
  const { caller, profile } = authz as { caller: NonNullable<Awaited<ReturnType<typeof callerFromRequest>>>; profile: UserRow };
  const settings = await loadSettings(admin, caller.user.id);
  const hasPassword = await lookupHasPasswordProvider(admin, caller.user.id);
  return jsonResponse({ ok: true, ...statusPayload(profile, settings, hasPassword) });
}

async function confirmPassword(email: string, password: string, captchaToken: string) {
  const grant = await passwordGrant(email, password, captchaToken);
  return grant.ok;
}

async function confirmReauth(
  admin: AdminClient,
  userId: string,
  email: string,
  password: string,
  captchaToken: string,
): Promise<Response | null> {
  const hasPassword = await lookupHasPasswordProvider(admin, userId);
  if (!hasPassword) {
    if (!captchaToken) return fromError(publicError("Please complete the CAPTCHA before continuing.", 400));
    return null;
  }
  if (!password) return fromError(publicError("Password is required.", 400));
  if (!(await confirmPassword(email, password, captchaToken))) {
    return fromError(publicError("Incorrect password.", 401));
  }
  return null;
}

async function handleTotpEnrollStart(req: Request, admin: AdminClient, body: Body) {
  const authz = await requireApprovedCaller(req, admin);
  if ("error" in authz && authz.error) return fromError(authz.error);
  const { caller, profile } = authz as { caller: NonNullable<Awaited<ReturnType<typeof callerFromRequest>>>; profile: UserRow };
  const password = String(body.password || "");
  const captchaToken = String(body.captchaToken || "");
  const denied = await confirmReauth(
    admin,
    caller.user.id,
    profile.email || caller.user.email || "",
    password,
    captchaToken,
  );
  if (denied) return denied;
  const account = profile.email || caller.user.email || profile.id;
  const enroll = await startTotpEnroll(account);
  const settings = await ensureSettings(admin, caller.user.id);
  await admin
    .from("user_mfa_settings")
    .update({
      totp_pending_secret_enc: enroll.secretEnc,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", settings.user_id);

  await writeAudit(admin, {
    actorId: caller.user.id,
    actorEmail: profile.email,
    actorRole: profile.role === "admin" ? "admin" : "member",
    action: settings.totp_enabled ? "mfa_totp_replace_started" : "mfa_totp_enroll_started",
    summary: settings.totp_enabled ? "Authenticator replacement started" : "Authenticator setup started",
    entityId: caller.user.id,
  });

  return jsonResponse({
    ok: true,
    secret: enroll.secretBase32,
    otpauthUri: enroll.otpauthUri,
    replacing: Boolean(settings.totp_enabled),
  });
}

async function maybeIssueRecovery(admin: AdminClient, settings: Awaited<ReturnType<typeof loadSettings>>, userId: string) {
  const alreadyEnabled = Boolean(settings?.totp_enabled || settings?.email_enabled);
  if (alreadyEnabled) return null;
  return replaceRecoveryCodes(admin, userId);
}

async function handleTotpEnrollVerify(req: Request, admin: AdminClient, body: Body) {
  const authz = await requireApprovedCaller(req, admin);
  if ("error" in authz && authz.error) return fromError(authz.error);
  const { caller, profile } = authz as { caller: NonNullable<Awaited<ReturnType<typeof callerFromRequest>>>; profile: UserRow };
  const code = String(body.code || "");
  const settings = await loadSettings(admin, caller.user.id);
  if (!settings?.totp_pending_secret_enc) {
    return fromError(publicError("Authenticator setup is not in progress.", 400));
  }
  const limit = await checkRateLimit(admin, `setup_totp:${caller.user.id}`, RATE_LIMITS.setupVerify);
  if (!limit.allowed) return fromError(tooMany());
  const result = await verifyStoredTotp(settings, code, "totp_pending_secret_enc");
  if (!result.valid) return fromError(genericInvalid());

  const replacing = settings.totp_enabled;
  const recoveryCodes = await maybeIssueRecovery(admin, settings, caller.user.id);
  await admin
    .from("user_mfa_settings")
    .update({
      totp_secret_enc: settings.totp_pending_secret_enc,
      totp_pending_secret_enc: null,
      totp_enabled: true,
      totp_confirmed_at: new Date().toISOString(),
      totp_last_timestep: result.timestep,
      totp_last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", caller.user.id);

  if (caller.sessionId) {
    await markSessionVerified(admin, caller.sessionId, caller.user.id, "setup");
  }

  await writeAudit(admin, {
    actorId: caller.user.id,
    actorEmail: profile.email,
    actorRole: profile.role === "admin" ? "admin" : "member",
    action: replacing ? "mfa_totp_replaced" : "mfa_totp_enabled",
    summary: replacing ? "Authenticator app replaced" : "Authenticator app enabled",
    entityId: caller.user.id,
  });

  return jsonResponse({
    ok: true,
    recoveryCodes,
    recoveryWarning:
      "Save these recovery codes somewhere secure. They can be used to access your account if you lose your authentication method.",
  });
}

async function handleTotpEnrollCancel(req: Request, admin: AdminClient) {
  const authz = await requireApprovedCaller(req, admin);
  if ("error" in authz && authz.error) return fromError(authz.error);
  const { caller } = authz as { caller: NonNullable<Awaited<ReturnType<typeof callerFromRequest>>>; profile: UserRow };
  await admin
    .from("user_mfa_settings")
    .update({ totp_pending_secret_enc: null, updated_at: new Date().toISOString() })
    .eq("user_id", caller.user.id);
  return jsonResponse({ ok: true });
}

async function handleDisableMethod(req: Request, admin: AdminClient, body: Body, method: "totp" | "email") {
  const authz = await requireApprovedCaller(req, admin);
  if ("error" in authz && authz.error) return fromError(authz.error);
  const { caller, profile } = authz as { caller: NonNullable<Awaited<ReturnType<typeof callerFromRequest>>>; profile: UserRow };
  const password = String(body.password || "");
  const code = String(body.code || "");
  const captchaToken = String(body.captchaToken || "");
  const denied = await confirmReauth(
    admin,
    caller.user.id,
    profile.email || caller.user.email || "",
    password,
    captchaToken,
  );
  if (denied) return denied;
  const settings = await loadSettings(admin, caller.user.id);
  if (!settings) return fromError(publicError("Not found", 404));

  if (method === "totp") {
    if (!settings.totp_enabled) return jsonResponse({ ok: true });
    const result = await verifyStoredTotp(settings, code);
    if (!result.valid) return fromError(genericInvalid());
    await admin
      .from("user_mfa_settings")
      .update({
        totp_enabled: false,
        totp_secret_enc: null,
        totp_pending_secret_enc: null,
        totp_last_timestep: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", caller.user.id);
    await writeAudit(admin, {
      actorId: caller.user.id,
      actorEmail: profile.email,
      action: "mfa_totp_disabled",
      summary: "Authenticator app disabled",
      entityId: caller.user.id,
    });
  } else {
    if (!settings.email_enabled) return jsonResponse({ ok: true });
    const confirmMethod = String(body.confirmMethod || "email");
    if (confirmMethod === "totp" && settings.totp_enabled) {
      const result = await verifyStoredTotp(settings, code);
      if (!result.valid) return fromError(genericInvalid());
    } else {
      const consumed = await consumeEmailChallenge(admin, caller.user.id, "disable", code);
      if (!consumed.ok) return fromError(consumed.reason === "expired" ? expiredCode() : genericInvalid());
    }
    await admin
      .from("user_mfa_settings")
      .update({
        email_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", caller.user.id);
    await writeAudit(admin, {
      actorId: caller.user.id,
      actorEmail: profile.email,
      action: "mfa_email_disabled",
      summary: "Email verification disabled",
      entityId: caller.user.id,
    });
  }

  const next = await loadSettings(admin, caller.user.id);
  if (!mfaEnabled(next)) {
    await writeAudit(admin, {
      actorId: caller.user.id,
      actorEmail: profile.email,
      action: "mfa_disabled",
      summary: "Two-factor authentication disabled",
      entityId: caller.user.id,
    });
  }
  return jsonResponse({ ok: true });
}

async function handleEmailEnableStart(req: Request, admin: AdminClient, body: Body) {
  const authz = await requireApprovedCaller(req, admin);
  if ("error" in authz && authz.error) return fromError(authz.error);
  const { caller, profile } = authz as { caller: NonNullable<Awaited<ReturnType<typeof callerFromRequest>>>; profile: UserRow };
  const password = String(body.password || "");
  const captchaToken = String(body.captchaToken || "");
  const denied = await confirmReauth(
    admin,
    caller.user.id,
    profile.email || caller.user.email || "",
    password,
    captchaToken,
  );
  if (denied) return denied;
  const limit = await checkEmailSendLimits(admin, caller.user.id);
  if (!limit.allowed) return fromError(tooMany());
  await ensureSettings(admin, caller.user.id);
  const code = await createEmailChallenge(admin, caller.user.id, "enable");
  const sent = await sendMfaEmail(admin, profile, code, caller.user.id);
  if (!sent.ok) return fromError(publicError(sent.error || "Failed to send verification email", 502));
  return jsonResponse({ ok: true, maskedEmail: maskEmail(profile.email || "") });
}

async function handleEmailEnableVerify(req: Request, admin: AdminClient, body: Body) {
  const authz = await requireApprovedCaller(req, admin);
  if ("error" in authz && authz.error) return fromError(authz.error);
  const { caller, profile } = authz as { caller: NonNullable<Awaited<ReturnType<typeof callerFromRequest>>>; profile: UserRow };
  const code = String(body.code || "");
  const limit = await checkRateLimit(admin, `email_verify:${caller.user.id}`, RATE_LIMITS.emailVerify);
  if (!limit.allowed) return fromError(tooMany());
  const consumed = await consumeEmailChallenge(admin, caller.user.id, "enable", code);
  if (!consumed.ok) return fromError(consumed.reason === "expired" ? expiredCode() : genericInvalid());
  const settings = await ensureSettings(admin, caller.user.id);
  const recoveryCodes = await maybeIssueRecovery(admin, settings, caller.user.id);
  await admin
    .from("user_mfa_settings")
    .update({
      email_enabled: true,
      email_confirmed_at: new Date().toISOString(),
      email_last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", caller.user.id);
  if (caller.sessionId) {
    await markSessionVerified(admin, caller.sessionId, caller.user.id, "setup");
  }
  await writeAudit(admin, {
    actorId: caller.user.id,
    actorEmail: profile.email,
    action: "mfa_email_enabled",
    summary: "Email verification enabled",
    entityId: caller.user.id,
  });
  return jsonResponse({
    ok: true,
    recoveryCodes,
    recoveryWarning:
      "Save these recovery codes somewhere secure. They can be used to access your account if you lose your authentication method.",
  });
}

async function handleEmailDisableStart(req: Request, admin: AdminClient, body: Body) {
  const authz = await requireApprovedCaller(req, admin);
  if ("error" in authz && authz.error) return fromError(authz.error);
  const { caller, profile } = authz as { caller: NonNullable<Awaited<ReturnType<typeof callerFromRequest>>>; profile: UserRow };
  const password = String(body.password || "");
  const captchaToken = String(body.captchaToken || "");
  const denied = await confirmReauth(
    admin,
    caller.user.id,
    profile.email || caller.user.email || "",
    password,
    captchaToken,
  );
  if (denied) return denied;
  const limit = await checkEmailSendLimits(admin, caller.user.id);
  if (!limit.allowed) return fromError(tooMany());
  const code = await createEmailChallenge(admin, caller.user.id, "disable");
  const sent = await sendMfaEmail(admin, profile, code, caller.user.id);
  if (!sent.ok) return fromError(publicError(sent.error || "Failed to send verification email", 502));
  return jsonResponse({ ok: true, maskedEmail: maskEmail(profile.email || "") });
}

async function handleRecoveryGenerate(req: Request, admin: AdminClient, body: Body) {
  const authz = await requireApprovedCaller(req, admin);
  if ("error" in authz && authz.error) return fromError(authz.error);
  const { caller, profile } = authz as { caller: NonNullable<Awaited<ReturnType<typeof callerFromRequest>>>; profile: UserRow };
  const password = String(body.password || "");
  const captchaToken = String(body.captchaToken || "");
  const code = String(body.code || "");
  const denied = await confirmReauth(
    admin,
    caller.user.id,
    profile.email || caller.user.email || "",
    password,
    captchaToken,
  );
  if (denied) return denied;
  const settings = await loadSettings(admin, caller.user.id);
  if (!mfaEnabled(settings)) {
    return fromError(publicError("Enable an authentication method first.", 400));
  }
  if (settings?.totp_enabled) {
    const result = await verifyStoredTotp(settings, code);
    if (!result.valid) return fromError(genericInvalid());
  } else {
    const consumed = await consumeEmailChallenge(admin, caller.user.id, "reauth", code);
    if (!consumed.ok) return fromError(consumed.reason === "expired" ? expiredCode() : genericInvalid());
  }
  const recoveryCodes = await replaceRecoveryCodes(admin, caller.user.id);
  await writeAudit(admin, {
    actorId: caller.user.id,
    actorEmail: profile.email,
    action: "mfa_recovery_generated",
    summary: "Recovery codes regenerated",
    entityId: caller.user.id,
  });
  return jsonResponse({
    ok: true,
    recoveryCodes,
    recoveryWarning:
      "Save these recovery codes somewhere secure. They can be used to access your account if you lose your authentication method. Previous codes no longer work.",
  });
}

async function handlePasswordChange(req: Request, admin: AdminClient, body: Body) {
  const authz = await requireApprovedCaller(req, admin);
  if ("error" in authz && authz.error) return fromError(authz.error);
  const { caller, profile } = authz as { caller: NonNullable<Awaited<ReturnType<typeof callerFromRequest>>>; profile: UserRow };
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const captchaToken = String(body.captchaToken || "");
  if (newPassword.length < 8) {
    return fromError(publicError("Password must be at least 8 characters.", 400));
  }
  const denied = await confirmReauth(
    admin,
    caller.user.id,
    profile.email || caller.user.email || "",
    currentPassword,
    captchaToken,
  );
  if (denied) return denied;
  const { supabaseUrl, serviceRoleKey } = env();
  const service = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await service.auth.admin.updateUserById(caller.user.id, { password: newPassword });
  if (error) {
    console.error("password change failed", error.message);
    return fromError(publicError("Failed to update password.", 500));
  }
  await writeAudit(admin, {
    actorId: caller.user.id,
    actorEmail: profile.email,
    action: "password_change",
    summary: "Password changed from User Security",
    entityId: caller.user.id,
  });
  return jsonResponse({ ok: true });
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
      case "session_status":
        return await handleSessionStatus(req, admin);
      case "session_send_email":
        return await handleSessionSendEmail(req, admin);
      case "session_verify":
        return await handleSessionVerify(req, admin, body);
      case "status":
        return await handleStatus(req, admin);
      case "totp_enroll_start":
        return await handleTotpEnrollStart(req, admin, body);
      case "totp_enroll_verify":
        return await handleTotpEnrollVerify(req, admin, body);
      case "totp_enroll_cancel":
        return await handleTotpEnrollCancel(req, admin);
      case "totp_disable":
        return await handleDisableMethod(req, admin, body, "totp");
      case "email_enable_start":
        return await handleEmailEnableStart(req, admin, body);
      case "email_enable_verify":
        return await handleEmailEnableVerify(req, admin, body);
      case "email_disable_start":
        return await handleEmailDisableStart(req, admin, body);
      case "email_disable":
        return await handleDisableMethod(req, admin, body, "email");
      case "recovery_generate":
        return await handleRecoveryGenerate(req, admin, body);
      case "password_change":
        return await handlePasswordChange(req, admin, body);
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
