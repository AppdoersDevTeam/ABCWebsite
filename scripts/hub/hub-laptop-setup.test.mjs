import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  parseDotEnv,
  readHubEnvPresence,
  sessionStartContext,
  writeLaptopHubEnv,
} from '../../tools/hub-laptop-setup.mjs';

test('parseDotEnv ignores comments and strips quotes', () => {
  const parsed = parseDotEnv('APPDOERS_HUB_URL="https://example.test"\n# skip\nAPPDOERS_CURSOR_TOKEN=abc\n');
  assert.equal(parsed.APPDOERS_HUB_URL, 'https://example.test');
  assert.equal(parsed.APPDOERS_CURSOR_TOKEN, 'abc');
});

test('readHubEnvPresence finds a laptop hub.env token without exposing it', () => {
  const home = '/tmp/hub-home-test';
  const envFile = path.join(home, '.appdoers', 'hub.env');
  const files = {
    [envFile]: 'APPDOERS_HUB_URL=https://example.test\nAPPDOERS_CURSOR_TOKEN=secret-token\n',
  };
  const presence = readHubEnvPresence({
    home,
    env: {},
    existsSync: (filePath) => Boolean(files[filePath]),
    readFileSync: (filePath) => files[filePath],
  });
  assert.equal(presence.tokenSet, true);
  assert.equal(presence.hubUrlSet, true);
  assert.equal(JSON.stringify(presence).includes('secret-token'), false);
});

test('readHubEnvPresence reports missing token on a fresh laptop', () => {
  const presence = readHubEnvPresence({
    home: '/tmp/empty-home',
    env: {},
    existsSync: () => false,
    readFileSync: () => {
      throw new Error('should not read');
    },
  });
  assert.equal(presence.tokenSet, false);
});

test('writeLaptopHubEnv writes only under the user profile', () => {
  const home = os.tmpdir();
  const written = {};
  const envPath = writeLaptopHubEnv({
    home,
    token: 'test-token',
    hubUrl: 'https://example.test',
    mkdirSync: () => {},
    writeFileSync: (filePath, body) => {
      written.path = filePath;
      written.body = body;
    },
  });
  assert.match(envPath, /\.appdoers[\\/]hub\.env$/);
  assert.equal(written.path, envPath);
  assert.match(written.body, /APPDOERS_CURSOR_TOKEN=test-token/);
});

test('sessionStart context tells a new laptop to stop and set up a token', () => {
  const missing = sessionStartContext({ tokenSet: false });
  assert.match(missing.additional_context, /no Appdoers Hub token/);
  assert.match(missing.additional_context, /setup-hub-token/);
  const ready = sessionStartContext({ tokenSet: true });
  assert.match(ready.additional_context, /whoami/);
});
