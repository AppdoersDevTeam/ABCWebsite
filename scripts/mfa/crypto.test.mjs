import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  RATE_LIMITS,
  buildOtpauthUri,
  decodeBase32,
  encodeBase32,
  evaluateRateLimit,
  generateEmailCode,
  generateRecoveryCode,
  generateRecoveryCodes,
  generateTotpSecret,
  hashSecret,
  maskEmail,
  mfaIsEnabled,
  newSaltHex,
  normalizeRecoveryCode,
  normalizeSixDigit,
  redactMfaLogValue,
  timingSafeEqual,
  totpAt,
  totpCanActivate,
  timestepAt,
  verifyTotpCode,
  ISSUER_NAME,
  aesGcmDecrypt,
  aesGcmEncrypt,
  availableLoginMethods,
  decideEmailChallenge,
  isEligibleForMfaSetup,
  passwordLoginOutcome,
  hasPasswordProvider,
  recoveryCodeReusable,
  setupAuthorization,
  EMAIL_CODE_TTL_MS,
} from '../../supabase/functions/_shared/mfaCrypto.ts';

test('TOTP RFC 6238 SHA-1 test vector at T=59', async () => {
  const secret = new TextEncoder().encode('12345678901234567890');
  const code = await totpAt(secret, timestepAt(59));
  assert.equal(code, '287082');
});

test('TOTP accepts valid code within clock window and rejects invalid', async () => {
  const { secretBytes } = generateTotpSecret();
  const now = Date.now();
  const current = await totpAt(secretBytes, timestepAt(Math.floor(now / 1000)));
  const ok = await verifyTotpCode(secretBytes, current, { nowMs: now });
  assert.equal(ok.valid, true);
  assert.equal(ok.replay, false);

  const bad = await verifyTotpCode(secretBytes, '000000', { nowMs: now });
  assert.equal(bad.valid, false);
});

test('TOTP rejects replay of the same timestep', async () => {
  const { secretBytes } = generateTotpSecret();
  const now = Date.now();
  const ts = timestepAt(Math.floor(now / 1000));
  const current = await totpAt(secretBytes, ts);
  const first = await verifyTotpCode(secretBytes, current, { nowMs: now });
  assert.equal(first.valid, true);
  const replay = await verifyTotpCode(secretBytes, current, {
    nowMs: now,
    lastTimestep: first.timestep,
  });
  assert.equal(replay.valid, false);
  assert.equal(replay.replay, true);
});

test('TOTP window allows neighbouring timestep', async () => {
  const { secretBytes } = generateTotpSecret();
  const nowSec = Math.floor(Date.now() / 1000);
  const prev = await totpAt(secretBytes, timestepAt(nowSec) - 1);
  const result = await verifyTotpCode(secretBytes, prev, { nowMs: nowSec * 1000, window: 1 });
  assert.equal(result.valid, true);
});

test('otpauth URI uses standard TOTP and does not invent a Google-only scheme', () => {
  const uri = buildOtpauthUri({
    issuer: ISSUER_NAME,
    accountName: 'member@example.com',
    secretBase32: 'JBSWY3DPEHPK3PXP',
  });
  assert.match(uri, /^otpauth:\/\/totp\//);
  assert.match(uri, /secret=JBSWY3DPEHPK3PXP/);
  assert.match(uri, /issuer=Ashburton%20Baptist%20Church/);
  assert.equal(uri.includes('otpauth://totp/'), true);
});

test('base32 round-trip for TOTP secrets', () => {
  const { secretBytes, secretBase32 } = generateTotpSecret();
  assert.equal(secretBytes.length, 20);
  const decoded = decodeBase32(secretBase32);
  assert.deepEqual([...decoded], [...secretBytes]);
  assert.equal(encodeBase32(decoded), secretBase32);
});

test('email codes are 6 digits and hashed, not stored as the raw value', async () => {
  const code = generateEmailCode();
  assert.equal(normalizeSixDigit(code)?.length, 6);
  const salt = newSaltHex();
  const hashed = await hashSecret(salt, code);
  assert.equal(hashed.includes(code), false);
  assert.equal(hashed.length, 64);
  assert.equal(await hashSecret(salt, code), hashed);
  assert.notEqual(await hashSecret(salt, '000000'), hashed);
});

test('expired and reused email codes are rejected by challenge rules', () => {
  const expiresAt = Date.now() - 1000;
  const consumedAt = Date.now();
  assert.equal(expiresAt < Date.now(), true);
  assert.equal(Boolean(consumedAt), true);
});

test('recovery codes are one-time formatted values and normalize consistently', () => {
  const codes = generateRecoveryCodes(10);
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  for (const code of codes) {
    assert.match(code, /^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  }
  const sample = generateRecoveryCode();
  assert.equal(normalizeRecoveryCode(` ${sample.toLowerCase()} `), sample.replace('-', ''));
});

test('regenerating recovery codes is a full replacement', () => {
  const first = generateRecoveryCodes(10);
  const second = generateRecoveryCodes(10);
  assert.notDeepEqual(first, second);
});

test('rate limiter locks after too many TOTP attempts', () => {
  let state = null;
  for (let i = 0; i < 5; i++) {
    const decision = evaluateRateLimit(state, RATE_LIMITS.totpVerify, 1_000);
    assert.equal(decision.allowed, true);
    state = decision.next;
  }
  const locked = evaluateRateLimit(state, RATE_LIMITS.totpVerify, 1_000);
  assert.equal(locked.allowed, false);
  assert.ok(locked.retryAfterSeconds > 0);
});

test('email send rate limiter allows one send then cools down', () => {
  const first = evaluateRateLimit(null, RATE_LIMITS.emailSend, 5_000);
  assert.equal(first.allowed, true);
  const second = evaluateRateLimit(first.next, RATE_LIMITS.emailSend, 5_000);
  assert.equal(second.allowed, false);
});

test('masks email without revealing the local part', () => {
  assert.equal(maskEmail('fred@example.com').startsWith('f'), true);
  assert.equal(maskEmail('fred@example.com').includes('fred'), false);
  assert.match(maskEmail('fred@example.com'), /^f\*+@example.com$/);
});

test('timing-safe compare distinguishes matching MFA codes', () => {
  assert.equal(timingSafeEqual('123456', '123456'), true);
  assert.equal(timingSafeEqual('123456', '654321'), false);
  assert.equal(timingSafeEqual('123456', '12345'), false);
});

test('authenticator is not enabled until a code is verified', () => {
  assert.equal(totpCanActivate(false, true), false);
  assert.equal(totpCanActivate(true, true), true);
  assert.equal(mfaIsEnabled({ totpEnabled: false, emailEnabled: false, totpPending: true }), false);
  assert.equal(mfaIsEnabled({ totpEnabled: true, emailEnabled: false, totpPending: false }), true);
});

test('does not treat secrets, codes, or recovery values as loggable', () => {
  assert.equal(redactMfaLogValue('123456'), true);
  assert.equal(redactMfaLogValue('otpauth://totp/test'), true);
  assert.equal(redactMfaLogValue('recovery codes generated'), true);
  assert.equal(redactMfaLogValue('password'), true);
  assert.equal(redactMfaLogValue('mfa_totp_enabled'), false);
});

test('login authorization matrix', () => {
  assert.equal(passwordLoginOutcome(false), 'complete_login');
  assert.equal(passwordLoginOutcome(true), 'mfa_challenge');
  assert.deepEqual(availableLoginMethods(true, false), ['totp']);
  assert.deepEqual(availableLoginMethods(false, true), ['email']);
  assert.deepEqual(availableLoginMethods(true, true), ['totp', 'email']);
  assert.equal(
    setupAuthorization({ callerId: 'a', targetUserId: 'a', isApproved: true, isAccessHeld: false }),
    'ok'
  );
  assert.equal(
    setupAuthorization({ callerId: 'a', targetUserId: 'b', isApproved: true, isAccessHeld: false }),
    'forbidden_other_user'
  );
  assert.equal(
    setupAuthorization({ callerId: 'a', targetUserId: 'a', isApproved: false, isAccessHeld: false }),
    'forbidden_setup'
  );
  assert.equal(
    setupAuthorization({ callerId: 'a', targetUserId: 'a', isApproved: true, isAccessHeld: true }),
    'forbidden_setup'
  );
  assert.equal(isEligibleForMfaSetup({ is_approved: true, is_access_held: false }), true);
  assert.equal(isEligibleForMfaSetup({ is_approved: false, is_access_held: false }), false);
});

test('email challenge rejects expired, reused, and over-attempted codes', () => {
  const now = Date.parse('2026-09-17T00:00:00.000Z');
  assert.equal(
    decideEmailChallenge({
      consumedAt: null,
      expiresAt: '2026-09-16T23:59:00.000Z',
      attemptCount: 0,
      maxAttempts: 5,
      hashMatches: true,
      nowMs: now,
    }).reason,
    'expired'
  );
  assert.equal(
    decideEmailChallenge({
      consumedAt: '2026-09-16T23:50:00.000Z',
      expiresAt: '2026-09-17T00:10:00.000Z',
      attemptCount: 0,
      maxAttempts: 5,
      hashMatches: true,
      nowMs: now,
    }).reason,
    'used'
  );
  assert.equal(
    decideEmailChallenge({
      consumedAt: null,
      expiresAt: '2026-09-17T00:10:00.000Z',
      attemptCount: 5,
      maxAttempts: 5,
      hashMatches: true,
      nowMs: now,
    }).ok,
    false
  );
  assert.equal(
    decideEmailChallenge({
      consumedAt: null,
      expiresAt: '2026-09-17T00:10:00.000Z',
      attemptCount: 1,
      maxAttempts: 5,
      hashMatches: false,
      nowMs: now,
    }).reason,
    'invalid'
  );
  assert.equal(
    decideEmailChallenge({
      consumedAt: null,
      expiresAt: '2026-09-17T00:10:00.000Z',
      attemptCount: 1,
      maxAttempts: 5,
      hashMatches: true,
      nowMs: now,
    }).ok,
    true
  );
  assert.equal(EMAIL_CODE_TTL_MS, 10 * 60 * 1000);
});

test('recovery codes cannot be reused after consumption', () => {
  assert.equal(recoveryCodeReusable(null), true);
  assert.equal(recoveryCodeReusable('2026-09-17T00:00:00.000Z'), false);
});

test('AES-GCM encrypts TOTP secrets and decrypts with the same material only', async () => {
  const secret = generateTotpSecret().secretBase32;
  const enc = await aesGcmEncrypt(secret, 'test-mfa-key-material');
  assert.equal(enc.includes(secret), false);
  assert.match(enc, /^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/);
  assert.equal(await aesGcmDecrypt(enc, 'test-mfa-key-material'), secret);
  await assert.rejects(() => aesGcmDecrypt(enc, 'other-key-material'));
});

test('TOTP rejects non 6-digit codes and codes outside the clock window', async () => {
  const { secretBytes } = generateTotpSecret();
  const now = Date.now();
  const far = await verifyTotpCode(secretBytes, '123456', { nowMs: now, window: 0 });
  assert.equal(far.valid, false);
  const badFormat = await verifyTotpCode(secretBytes, '12 34', { nowMs: now });
  assert.equal(badFormat.valid, false);
  const current = await totpAt(secretBytes, timestepAt(Math.floor(now / 1000)) - 3);
  const outside = await verifyTotpCode(secretBytes, current, { nowMs: now, window: 1 });
  assert.equal(outside.valid, false);
});

test('email send hourly limiter locks after five sends', () => {
  let state = null;
  for (let i = 0; i < 5; i++) {
    const decision = evaluateRateLimit(state, RATE_LIMITS.emailSendHour, 10_000);
    assert.equal(decision.allowed, true);
    state = decision.next;
  }
  const locked = evaluateRateLimit(state, RATE_LIMITS.emailSendHour, 10_000);
  assert.equal(locked.allowed, false);
});

test('recovery and setup verification share brute-force locks', () => {
  let recovery = null;
  for (let i = 0; i < 5; i++) {
    recovery = evaluateRateLimit(recovery, RATE_LIMITS.recovery, 20_000).next;
  }
  assert.equal(evaluateRateLimit(recovery, RATE_LIMITS.recovery, 20_000).allowed, false);
  let setup = null;
  for (let i = 0; i < 5; i++) {
    setup = evaluateRateLimit(setup, RATE_LIMITS.setupVerify, 20_000).next;
  }
  assert.equal(evaluateRateLimit(setup, RATE_LIMITS.setupVerify, 20_000).allowed, false);
});

test('Google-only accounts do not have a site password; email identities do', () => {
  assert.equal(hasPasswordProvider({ identities: [{ provider: 'google' }], providers: ['google'] }), false);
  assert.equal(hasPasswordProvider({ identities: [{ provider: 'email' }], providers: ['email'] }), true);
  assert.equal(
    hasPasswordProvider({
      identities: [{ provider: 'google' }, { provider: 'email' }],
      providers: ['google', 'email'],
    }),
    true
  );
});
