/** Pure MFA crypto helpers. Safe to import from Deno Edge Functions and mirrored in tests. */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const RECOVERY_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const TOTP_PERIOD_SECONDS = 30;
export const TOTP_DIGITS = 6;
export const TOTP_WINDOW = 1;
export const TOTP_SECRET_BYTES = 20;
export const EMAIL_CODE_DIGITS = 6;
export const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;
export const RECOVERY_CODE_COUNT = 10;
export const ISSUER_NAME = "Ashburton Baptist Church";

export function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const left = enc.encode(a);
  const right = enc.encode(b);
  const len = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < len; i++) {
    const lv = i < left.length ? left[i] : 0;
    const rv = i < right.length ? right[i] : 0;
    diff |= lv ^ rv;
  }
  return diff === 0;
}

export function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-f]/gi, "");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function base64ToBytes(value: string): Uint8Array {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function encodeBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function decodeBase32(input: string): Uint8Array {
  const cleaned = input.toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

export function generateTotpSecret(): { secretBytes: Uint8Array; secretBase32: string } {
  const secretBytes = randomBytes(TOTP_SECRET_BYTES);
  return { secretBytes, secretBase32: encodeBase32(secretBytes) };
}

function counterToBytes(counter: number): Uint8Array {
  const bytes = new Uint8Array(8);
  let n = counter;
  for (let i = 7; i >= 0; i--) {
    bytes[i] = n & 255;
    n = Math.floor(n / 256);
  }
  return bytes;
}

export async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const keyCopy = Uint8Array.from(key);
  const dataCopy = Uint8Array.from(data);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyCopy,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, dataCopy);
  return new Uint8Array(sig);
}

export async function totpAt(secretBytes: Uint8Array, timestep: number, digits = TOTP_DIGITS): Promise<string> {
  const hmac = await hmacSha1(secretBytes, counterToBytes(timestep));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = binary % 10 ** digits;
  return String(otp).padStart(digits, "0");
}

export function timestepAt(unixSeconds: number, period = TOTP_PERIOD_SECONDS): number {
  return Math.floor(unixSeconds / period);
}

export type TotpVerifyResult = {
  valid: boolean;
  timestep: number | null;
  replay: boolean;
};

export async function verifyTotpCode(
  secretBytes: Uint8Array,
  code: string,
  options: {
    nowMs?: number;
    lastTimestep?: number | null;
    window?: number;
  } = {},
): Promise<TotpVerifyResult> {
  const cleaned = (code || "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) {
    return { valid: false, timestep: null, replay: false };
  }
  const nowMs = options.nowMs ?? Date.now();
  const window = options.window ?? TOTP_WINDOW;
  const current = timestepAt(Math.floor(nowMs / 1000));
  const last = options.lastTimestep ?? null;

  let matched: number | null = null;
  for (let delta = -window; delta <= window; delta++) {
    const ts = current + delta;
    const expected = await totpAt(secretBytes, ts);
    if (timingSafeEqual(expected, cleaned)) {
      matched = ts;
    }
  }
  if (matched === null) {
    return { valid: false, timestep: null, replay: false };
  }
  if (last !== null && matched <= last) {
    return { valid: false, timestep: matched, replay: true };
  }
  return { valid: true, timestep: matched, replay: false };
}

export function buildOtpauthUri(params: {
  issuer: string;
  accountName: string;
  secretBase32: string;
}): string {
  const issuer = encodeURIComponent(params.issuer);
  const account = encodeURIComponent(params.accountName);
  const secret = params.secretBase32.replace(/\s+/g, "");
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD_SECONDS}`;
}

export function generateEmailCode(): string {
  const bytes = randomBytes(4);
  const n = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  return String(n % 1_000_000).padStart(EMAIL_CODE_DIGITS, "0");
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

export async function hashSecret(saltHex: string, value: string): Promise<string> {
  return sha256Hex(`${saltHex}:${value}`);
}

export function newSaltHex(bytes = 16): string {
  return bytesToHex(randomBytes(bytes));
}

export function generateRecoveryCode(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (const b of bytes) {
    out += RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length];
  }
  return `${out.slice(0, 4)}-${out.slice(4, 8)}`;
}

export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  const codes = new Set<string>();
  while (codes.size < count) {
    codes.add(generateRecoveryCode());
  }
  return [...codes];
}

export function normalizeRecoveryCode(input: string): string {
  return (input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function maskEmail(email: string): string {
  const trimmed = (email || "").trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "*****";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const visible = local.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(3, Math.min(6, local.length)))}@${domain}`;
}

export function normalizeSixDigit(code: string): string | null {
  const cleaned = (code || "").replace(/\s+/g, "");
  return /^\d{6}$/.test(cleaned) ? cleaned : null;
}

export type RateLimitState = {
  bucket: string;
  windowStartedAt: string;
  attemptCount: number;
  lockedUntil: string | null;
};

export type RateLimitConfig = {
  maxAttempts: number;
  windowMs: number;
  lockMs: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
  next: RateLimitState;
};

export function evaluateRateLimit(
  current: RateLimitState | null,
  config: RateLimitConfig,
  nowMs = Date.now(),
): RateLimitDecision {
  const nowIso = new Date(nowMs).toISOString();
  if (current?.lockedUntil) {
    const lockedUntil = Date.parse(current.lockedUntil);
    if (Number.isFinite(lockedUntil) && lockedUntil > nowMs) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((lockedUntil - nowMs) / 1000)),
        next: current,
      };
    }
  }

  const windowStart = current ? Date.parse(current.windowStartedAt) : NaN;
  const inWindow = Number.isFinite(windowStart) && nowMs - windowStart < config.windowMs;
  const attemptCount = inWindow ? (current?.attemptCount ?? 0) + 1 : 1;
  const windowStartedAt = inWindow && current ? current.windowStartedAt : nowIso;
  const locked =
    attemptCount > config.maxAttempts
      ? new Date(nowMs + config.lockMs).toISOString()
      : null;

  const next: RateLimitState = {
    bucket: current?.bucket || "",
    windowStartedAt,
    attemptCount,
    lockedUntil: locked,
  };

  if (locked) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(config.lockMs / 1000),
      next,
    };
  }

  return { allowed: true, retryAfterSeconds: 0, next };
}

export const RATE_LIMITS = {
  totpVerify: { maxAttempts: 5, windowMs: 5 * 60 * 1000, lockMs: 15 * 60 * 1000 },
  emailSend: { maxAttempts: 1, windowMs: 60 * 1000, lockMs: 60 * 1000 },
  emailSendHour: { maxAttempts: 5, windowMs: 60 * 60 * 1000, lockMs: 60 * 60 * 1000 },
  emailVerify: { maxAttempts: 5, windowMs: 15 * 60 * 1000, lockMs: 15 * 60 * 1000 },
  recovery: { maxAttempts: 5, windowMs: 15 * 60 * 1000, lockMs: 15 * 60 * 1000 },
  loginBegin: { maxAttempts: 8, windowMs: 15 * 60 * 1000, lockMs: 15 * 60 * 1000 },
  setupVerify: { maxAttempts: 5, windowMs: 5 * 60 * 1000, lockMs: 15 * 60 * 1000 },
} as const;

export function redactMfaLogValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const v = value.toLowerCase();
  return (
    v.includes("secret") ||
    v.includes("otpauth") ||
    v.includes("recovery") ||
    v.includes("password") ||
    /^\d{6}$/.test(value)
  );
}

export type MfaFlowState = {
  totpEnabled: boolean;
  emailEnabled: boolean;
  totpPending: boolean;
};

export function mfaIsEnabled(state: MfaFlowState): boolean {
  return state.totpEnabled || state.emailEnabled;
}

export function totpCanActivate(verified: boolean, pendingExists: boolean): boolean {
  return verified && pendingExists;
}

export function recoveryCodesInvalidatePrevious(): boolean {
  return true;
}

export function isEligibleForMfaSetup(profile: {
  is_approved?: boolean | null;
  is_access_held?: boolean | null;
}): boolean {
  return profile.is_approved === true && profile.is_access_held !== true;
}

export function setupAuthorization(params: {
  callerId: string;
  targetUserId: string;
  isApproved: boolean;
  isAccessHeld: boolean;
}): "ok" | "forbidden_other_user" | "forbidden_setup" {
  if (!params.callerId || params.callerId !== params.targetUserId) return "forbidden_other_user";
  if (!params.isApproved || params.isAccessHeld) return "forbidden_setup";
  return "ok";
}

export function passwordLoginOutcome(mfaOn: boolean): "complete_login" | "mfa_challenge" {
  return mfaOn ? "mfa_challenge" : "complete_login";
}

export function availableLoginMethods(totpEnabled: boolean, emailEnabled: boolean): Array<"totp" | "email"> {
  const methods: Array<"totp" | "email"> = [];
  if (totpEnabled) methods.push("totp");
  if (emailEnabled) methods.push("email");
  return methods;
}

export type EmailChallengeDecision = {
  ok: boolean;
  reason?: "invalid" | "expired" | "used";
};

export function decideEmailChallenge(params: {
  consumedAt: string | null;
  expiresAt: string;
  attemptCount: number;
  maxAttempts: number;
  hashMatches: boolean;
  nowMs?: number;
}): EmailChallengeDecision {
  const nowMs = params.nowMs ?? Date.now();
  if (params.consumedAt) return { ok: false, reason: "used" };
  if (Date.parse(params.expiresAt) <= nowMs) return { ok: false, reason: "expired" };
  if (params.attemptCount >= params.maxAttempts) return { ok: false, reason: "invalid" };
  if (!params.hashMatches) return { ok: false, reason: "invalid" };
  return { ok: true };
}

export function recoveryCodeReusable(consumedAt: string | null): boolean {
  return consumedAt == null;
}

async function aesKeyFromMaterial(material: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`abc-mfa-aes-v1:${material}`),
  );
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function aesGcmEncrypt(plain: string, material: string): Promise<string> {
  if (!material) throw new Error("missing_mfa_key");
  const key = await aesKeyFromMaterial(material);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plain);
  const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(buf))}`;
}

export async function aesGcmDecrypt(payload: string, material: string): Promise<string> {
  if (!material) throw new Error("missing_mfa_key");
  const key = await aesKeyFromMaterial(material);
  const [ivB64, dataB64] = payload.split(".");
  if (!ivB64 || !dataB64) throw new Error("bad_ciphertext");
  const iv = base64ToBytes(ivB64);
  const data = base64ToBytes(dataB64);
  const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(buf);
}
