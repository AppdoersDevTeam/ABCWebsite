import { type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import {
  RATE_LIMITS,
  type RateLimitConfig,
  type RateLimitState,
  aesGcmDecrypt,
  aesGcmEncrypt,
  decodeBase32,
  decideEmailChallenge,
  evaluateRateLimit,
  generateEmailCode,
  generateRecoveryCodes,
  generateTotpSecret,
  hashSecret,
  maskEmail,
  newSaltHex,
  timingSafeEqual,
  normalizeRecoveryCode,
  normalizeSixDigit,
  verifyTotpCode,
  EMAIL_CODE_TTL_MS,
  ISSUER_NAME,
  buildOtpauthUri,
  isEligibleForMfaSetup,
  hasPasswordProvider,
} from "./mfaCrypto.ts";

export type AdminClient = SupabaseClient;

export type UserRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  is_approved: boolean | null;
  is_access_held: boolean | null;
  role: string | null;
};

export type MfaSettingsRow = {
  user_id: string;
  totp_enabled: boolean;
  email_enabled: boolean;
  totp_secret_enc: string | null;
  totp_pending_secret_enc: string | null;
  totp_confirmed_at: string | null;
  totp_last_used_at: string | null;
  totp_last_timestep: number | null;
  email_confirmed_at: string | null;
  email_last_used_at: string | null;
  recovery_generated_at: string | null;
  recovery_remaining: number;
};

const GENERIC_INVALID = "Invalid verification code.";
const GENERIC_TOO_MANY = "Too many attempts. Please try again later.";
const GENERIC_EXPIRED = "Verification code expired. Request a new code.";

export function publicError(message: string, status = 400) {
  return { error: message, status };
}

export function genericInvalid() {
  return publicError(GENERIC_INVALID, 401);
}

export function tooMany() {
  return publicError(GENERIC_TOO_MANY, 429);
}

export function expiredCode() {
  return publicError(GENERIC_EXPIRED, 400);
}

function encryptionMaterial(): string {
  const explicit = (Deno.env.get("MFA_ENCRYPTION_KEY") || "").trim();
  const fallback = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();
  const material = explicit || fallback;
  if (!material) {
    throw new Error("missing_mfa_key");
  }
  return material;
}

export async function encryptText(plain: string): Promise<string> {
  return aesGcmEncrypt(plain, encryptionMaterial());
}

export async function decryptText(payload: string): Promise<string> {
  return aesGcmDecrypt(payload, encryptionMaterial());
}

export function firstNameOf(user: UserRow): string {
  return (
    (user.first_name || "").trim() ||
    (user.name || "").trim().split(/\s+/)[0] ||
    ""
  );
}

export async function loadUser(admin: AdminClient, userId: string): Promise<UserRow | null> {
  const { data } = await admin
    .from("users")
    .select("id, email, first_name, last_name, name, is_approved, is_access_held, role")
    .eq("id", userId)
    .maybeSingle();
  return (data as UserRow | null) ?? null;
}

export async function loadSettings(admin: AdminClient, userId: string): Promise<MfaSettingsRow | null> {
  const { data } = await admin
    .from("user_mfa_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as MfaSettingsRow | null) ?? null;
}

export async function ensureSettings(admin: AdminClient, userId: string): Promise<MfaSettingsRow> {
  const existing = await loadSettings(admin, userId);
  if (existing) return existing;
  const { data, error } = await admin
    .from("user_mfa_settings")
    .insert({ user_id: userId })
    .select("*")
    .single();
  if (error || !data) {
    const again = await loadSettings(admin, userId);
    if (again) return again;
    throw new Error("settings_create_failed");
  }
  return data as MfaSettingsRow;
}

export function methodsOf(settings: MfaSettingsRow | null): Array<"totp" | "email"> {
  const methods: Array<"totp" | "email"> = [];
  if (settings?.totp_enabled) methods.push("totp");
  if (settings?.email_enabled) methods.push("email");
  return methods;
}

export function mfaEnabled(settings: MfaSettingsRow | null): boolean {
  return Boolean(settings?.totp_enabled || settings?.email_enabled);
}

export function isEligibleForSetup(profile: UserRow): boolean {
  return isEligibleForMfaSetup(profile);
}

export async function checkRateLimit(
  admin: AdminClient,
  bucket: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const { data } = await admin
    .from("mfa_rate_limits")
    .select("bucket, window_started_at, attempt_count, locked_until")
    .eq("bucket", bucket)
    .maybeSingle();

  const current: RateLimitState | null = data
    ? {
        bucket: data.bucket,
        windowStartedAt: data.window_started_at,
        attemptCount: data.attempt_count,
        lockedUntil: data.locked_until,
      }
    : null;

  const decision = evaluateRateLimit(current, config);
  decision.next.bucket = bucket;
  await admin.from("mfa_rate_limits").upsert({
    bucket,
    window_started_at: decision.next.windowStartedAt,
    attempt_count: decision.next.attemptCount,
    locked_until: decision.next.lockedUntil,
  });
  return { allowed: decision.allowed, retryAfterSeconds: decision.retryAfterSeconds };
}

export async function writeAudit(
  admin: AdminClient,
  params: {
    actorId?: string | null;
    actorEmail?: string | null;
    actorRole?: string;
    action: string;
    summary: string;
    entityId?: string | null;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  const details = { ...(params.details ?? {}), source: "mfa" };
  const { error } = await admin.from("audit_logs").insert({
    actor_id: params.actorId ?? null,
    actor_email: params.actorEmail ?? null,
    actor_label: params.actorEmail ?? null,
    actor_role: params.actorRole ?? "member",
    action: params.action,
    category: "auth",
    entity_type: "user_mfa_settings",
    entity_id: params.entityId ?? params.actorId ?? null,
    summary: params.summary,
    details,
  });
  if (error) {
    console.warn("[mfa] audit insert failed", error.message);
  }
}

export async function markSessionVerified(
  admin: AdminClient,
  sessionId: string,
  userId: string,
  method: "totp" | "email" | "recovery" | "setup",
): Promise<void> {
  await admin.from("mfa_verified_sessions").upsert({
    session_id: sessionId,
    user_id: userId,
    method,
    verified_at: new Date().toISOString(),
    revoked_at: null,
  });
}

export function sessionIdFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.session_id === "string" ? payload.session_id : null;
  } catch {
    return null;
  }
}

export async function consumeEmailChallenge(
  admin: AdminClient,
  userId: string,
  purpose: string,
  code: string,
): Promise<{ ok: boolean; reason?: "invalid" | "expired" | "used" }> {
  const cleaned = normalizeSixDigit(code);
  if (!cleaned) return { ok: false, reason: "invalid" };

  const { data: rows } = await admin
    .from("mfa_email_challenges")
    .select("id, salt, code_hash, expires_at, attempt_count, max_attempts, consumed_at")
    .eq("user_id", userId)
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const row = rows?.[0];
  if (!row) return { ok: false, reason: "invalid" };

  const hashed = await hashSecret(row.salt, cleaned);
  const matches = timingSafeEqual(hashed, row.code_hash);
  const decision = decideEmailChallenge({
    consumedAt: row.consumed_at,
    expiresAt: row.expires_at,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    hashMatches: matches,
  });

  if (decision.reason === "expired") {
    await admin
      .from("mfa_email_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);
    return { ok: false, reason: "expired" };
  }

  if (decision.reason === "used") {
    return { ok: false, reason: "used" };
  }

  if (!decision.ok) {
    if (row.attempt_count >= row.max_attempts) {
      await admin
        .from("mfa_email_challenges")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", row.id);
      return { ok: false, reason: "invalid" };
    }
    const nextAttempts = row.attempt_count + 1;
    await admin
      .from("mfa_email_challenges")
      .update({
        attempt_count: nextAttempts,
        consumed_at: nextAttempts >= row.max_attempts ? new Date().toISOString() : null,
      })
      .eq("id", row.id);
    return { ok: false, reason: "invalid" };
  }

  await admin
    .from("mfa_email_challenges")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);
  return { ok: true };
}

export async function createEmailChallenge(
  admin: AdminClient,
  userId: string,
  purpose: string,
): Promise<string> {
  await admin
    .from("mfa_email_challenges")
    .update({ consumed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("purpose", purpose)
    .is("consumed_at", null);

  const code = generateEmailCode();
  const salt = newSaltHex();
  const code_hash = await hashSecret(salt, code);
  const { error } = await admin.from("mfa_email_challenges").insert({
    user_id: userId,
    purpose,
    salt,
    code_hash,
    expires_at: new Date(Date.now() + EMAIL_CODE_TTL_MS).toISOString(),
    attempt_count: 0,
    max_attempts: 5,
  });
  if (error) throw new Error("email_challenge_create_failed");
  return code;
}

export async function replaceRecoveryCodes(admin: AdminClient, userId: string): Promise<string[]> {
  const codes = generateRecoveryCodes();
  await admin.from("mfa_recovery_codes").delete().eq("user_id", userId);
  const rows = [];
  for (const code of codes) {
    const salt = newSaltHex();
    const normalized = normalizeRecoveryCode(code);
    rows.push({
      user_id: userId,
      salt,
      code_hash: await hashSecret(salt, normalized),
    });
  }
  const { error } = await admin.from("mfa_recovery_codes").insert(rows);
  if (error) throw new Error("recovery_create_failed");
  await admin
    .from("user_mfa_settings")
    .update({
      recovery_generated_at: new Date().toISOString(),
      recovery_remaining: codes.length,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  return codes;
}

export async function consumeRecoveryCode(
  admin: AdminClient,
  userId: string,
  code: string,
): Promise<boolean> {
  const normalized = normalizeRecoveryCode(code);
  if (normalized.length < 8) return false;
  const { data: rows } = await admin
    .from("mfa_recovery_codes")
    .select("id, salt, code_hash")
    .eq("user_id", userId)
    .is("consumed_at", null);

  let matchedId: string | null = null;
  for (const row of rows ?? []) {
    const hashed = await hashSecret(row.salt, normalized);
    if (timingSafeEqual(hashed, row.code_hash)) {
      matchedId = row.id;
    }
  }
  if (!matchedId) return false;
  await admin
    .from("mfa_recovery_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", matchedId);
  const remaining = (rows?.length ?? 1) - 1;
  await admin
    .from("user_mfa_settings")
    .update({ recovery_remaining: Math.max(0, remaining), updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  return true;
}

export async function verifyStoredTotp(
  settings: MfaSettingsRow,
  code: string,
  field: "totp_secret_enc" | "totp_pending_secret_enc" = "totp_secret_enc",
): Promise<{ valid: boolean; timestep: number | null; replay: boolean }> {
  const enc = settings[field];
  if (!enc) return { valid: false, timestep: null, replay: false };
  const secretBase32 = await decryptText(enc);
  const secretBytes = decodeBase32(secretBase32);
  return verifyTotpCode(secretBytes, code, {
    lastTimestep: field === "totp_secret_enc" ? settings.totp_last_timestep : null,
  });
}

export async function startTotpEnroll(accountName: string): Promise<{
  secretBase32: string;
  otpauthUri: string;
  secretEnc: string;
}> {
  const { secretBase32 } = generateTotpSecret();
  const otpauthUri = buildOtpauthUri({
    issuer: ISSUER_NAME,
    accountName,
    secretBase32,
  });
  return {
    secretBase32,
    otpauthUri,
    secretEnc: await encryptText(secretBase32),
  };
}

export { RATE_LIMITS, maskEmail, ISSUER_NAME, hasPasswordProvider };
