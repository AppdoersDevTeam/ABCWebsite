import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildMfaCodeEmailHtml, MFA_EMAIL_SUBJECT } from '../../supabase/functions/_shared/mfaEmailTemplate.ts';

test('MFA email template includes the code and expiry, not secrets', () => {
  const html = buildMfaCodeEmailHtml({
    firstName: 'Fred',
    code: '482913',
    expiryMinutes: 10,
  });
  assert.match(html, /Kia ora Fred/);
  assert.match(html, /482913/);
  assert.match(html, /expires in 10 minutes/);
  assert.equal(html.toLowerCase().includes('password'), false);
  assert.equal(html.toLowerCase().includes('otpauth'), false);
  assert.equal(html.toLowerCase().includes('secret'), false);
  assert.equal(MFA_EMAIL_SUBJECT, 'Your security verification code');
});
