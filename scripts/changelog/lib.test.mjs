import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  CHANGE_ID_RE,
  compareSemver,
  filesRequiringChangelog,
  formatChangeId,
  isValidChangeId,
  nextChangeId,
  renderChangelogMarkdown,
  validateChangelogDocument,
  writeChangelogFiles,
} from './lib.mjs';

function sampleDoc(overrides = {}) {
  return {
    project: 'ashburton-baptist-church',
    formatVersion: 1,
    timezone: 'Pacific/Auckland',
    versionSource: 'package.json',
    entries: [
      {
        id: 'CHG-2026-1609-001',
        date: '2026-09-16',
        time: '21:00:00',
        timezone: 'Pacific/Auckland',
        changedAt: '2026-09-16T09:00:00.000Z',
        version: '1.0.0',
        type: 'infrastructure',
        area: 'system',
        title: 'Governance',
        request: 'Add governance.',
        changes: ['Added changelog validation.'],
        changedBy: 'Test',
        database: { migrations: [] },
        validation: {
          unitTests: true,
          integrationTests: false,
          e2eTests: false,
          typeCheck: false,
          lint: false,
          build: true,
        },
        breakingChange: false,
        ...overrides.entry,
      },
    ],
    ...overrides.doc,
  };
}

test('accepts canonical and legacy change IDs', () => {
  assert.equal(CHANGE_ID_RE.test('CHG-2026-1609-001'), true);
  assert.equal(isValidChangeId('CHG-2026-1609-001'), true);
  assert.equal(isValidChangeId('2026-09-16-changelog-date-filters'), true);
  assert.equal(isValidChangeId('not-an-id'), false);
  assert.equal(isValidChangeId('CHG-2026-916-1'), false);
  assert.equal(isValidChangeId('CHG-2026-0916-001'), false);
});

test('generates the next Change ID for the same Auckland day', () => {
  const stamp = { date: '2026-09-16', time: '22:00:00', timezone: 'Pacific/Auckland' };
  assert.equal(nextChangeId([], stamp), 'CHG-2026-1609-001');
  assert.equal(
    nextChangeId([{ id: 'CHG-2026-1609-001' }, { id: '2026-09-16-legacy' }], stamp),
    'CHG-2026-1609-002'
  );
  assert.equal(formatChangeId('2026', '1609', 12), 'CHG-2026-1609-012');
});

test('detects duplicate IDs, missing fields, and invalid versions', () => {
  const doc = sampleDoc();
  doc.entries.push({ ...doc.entries[0], title: 'Copy' });
  const errors = validateChangelogDocument(doc, { packageVersion: '1.0.0' });
  assert.ok(errors.some((error) => error.includes('Duplicate Change ID')));

  const missing = sampleDoc({
    entry: { title: '', date: '16-09-2026', version: '1.0', type: 'feature' },
  });
  const missingErrors = validateChangelogDocument(missing, { packageVersion: '1.0.0' });
  assert.ok(missingErrors.some((error) => error.includes('title is required')));
  assert.ok(missingErrors.some((error) => error.includes('date must be YYYY-MM-DD')));
  assert.ok(missingErrors.some((error) => error.includes('not a valid semantic version')));
  assert.ok(missingErrors.some((error) => error.includes('not a recognised type')));
});

test('requires package version to match the latest changelog entry', () => {
  const errors = validateChangelogDocument(sampleDoc(), { packageVersion: '1.1.0' });
  assert.ok(errors.some((error) => error.includes('does not match package.json version')));
});

test('detects markdown/JSON drift', () => {
  const doc = sampleDoc();
  const errors = validateChangelogDocument(doc, {
    packageVersion: '1.0.0',
    markdown: '# Changelog\n\nwrong\n',
  });
  assert.ok(errors.some((error) => error.includes('out of sync')));
});

test('accepts a synchronized markdown rendering', () => {
  const doc = sampleDoc();
  const errors = validateChangelogDocument(doc, {
    packageVersion: '1.0.0',
    markdown: renderChangelogMarkdown(doc),
  });
  assert.deepEqual(errors, []);
});

test('flags missing referenced migrations', () => {
  const doc = sampleDoc({
    entry: { database: { migrations: ['does-not-exist.sql'] } },
  });
  const errors = validateChangelogDocument(doc, {
    packageVersion: '1.0.0',
    sqlFiles: new Map(),
  });
  assert.ok(errors.some((error) => error.includes('missing migration')));
});

test('flags destructive SQL without destructive: true', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'abc-changelog-'));
  const sqlPath = path.join(dir, 'drop_users.sql');
  fs.writeFileSync(sqlPath, 'DROP TABLE users;\n');
  const doc = sampleDoc({
    entry: { database: { migrations: ['drop_users.sql'] } },
  });
  const errors = validateChangelogDocument(doc, {
    packageVersion: '1.0.0',
    sqlFiles: new Map([['drop_users.sql', sqlPath]]),
  });
  assert.ok(errors.some((error) => error.includes('looks destructive')));
});

test('requires changelog when non-exempt files change', () => {
  assert.deepEqual(filesRequiringChangelog(['CHANGELOG.json', 'CHANGELOG.md']), []);
  assert.ok(filesRequiringChangelog(['App.tsx', 'CHANGELOG.json']).includes('App.tsx'));
  assert.equal(filesRequiringChangelog(['tickets/QA/ABC-FEAT-001.md']).length, 0);
});

test('compares semantic versions', () => {
  assert.ok(compareSemver('1.0.0', '0.0.0') > 0);
  assert.equal(compareSemver('1.2.3', '1.2.3'), 0);
});

test('writeChangelogFiles round-trips markdown sync', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'abc-changelog-write-'));
  const doc = sampleDoc();
  writeChangelogFiles(doc, dir);
  const markdown = fs.readFileSync(path.join(dir, 'CHANGELOG.md'), 'utf8');
  const json = JSON.parse(fs.readFileSync(path.join(dir, 'CHANGELOG.json'), 'utf8'));
  const errors = validateChangelogDocument(json, { packageVersion: '1.0.0', markdown });
  assert.deepEqual(errors, []);
});
