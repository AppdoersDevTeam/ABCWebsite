#!/usr/bin/env node
/**
 * One-time / guarded import of curated product history from lib/changelog.ts
 * into CHANGELOG.json. Refuses to overwrite unless --force is passed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { changelogJsonPath, DEFAULT_TIMEZONE, formatInTimeZone, writeChangelogFiles } from './lib.mjs';

const root = process.cwd();
const force = process.argv.includes('--force');
const jsonPath = changelogJsonPath(root);

if (fs.existsSync(jsonPath) && !force) {
  const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (Array.isArray(existing.entries) && existing.entries.length > 0) {
    console.error('CHANGELOG.json already exists. Re-run with --force to overwrite.');
    process.exit(1);
  }
}

const changelogTs = fs.readFileSync(path.join(root, 'lib', 'changelog.ts'), 'utf8');
if (!changelogTs.includes('export const CHANGELOG_ENTRIES: ChangelogEntry[] = [')) {
  console.error('lib/changelog.ts no longer contains a literal CHANGELOG_ENTRIES array. Import is not needed.');
  process.exit(1);
}
const start = changelogTs.indexOf('export const CHANGELOG_ENTRIES');
const arrayStart = changelogTs.indexOf('[', start);
const arrayEnd = changelogTs.indexOf('\nexport const CHANGELOG_MONTH_OPTIONS');
if (start < 0 || arrayStart < 0 || arrayEnd < 0) {
  console.error('Could not locate CHANGELOG_ENTRIES in lib/changelog.ts');
  process.exit(1);
}

const arraySrc = changelogTs.slice(arrayStart, arrayEnd).trim().replace(/;$/, '');
const tmpPath = path.join(root, 'scripts', 'changelog', '.tmp-legacy.mjs');
fs.writeFileSync(tmpPath, `export default ${arraySrc};\n`);

try {
  const { default: legacy } = await import(`${pathToFileURL(tmpPath).href}?t=${Date.now()}`);
  const entries = legacy.map((entry) => {
    const instant = new Date(entry.changedAt);
    const stamp = formatInTimeZone(instant, DEFAULT_TIMEZONE);
    const changes = Array.isArray(entry.details) && entry.details.length > 0 ? entry.details : [entry.summary];
    return {
      id: entry.id,
      date: stamp.date,
      time: stamp.time,
      timezone: DEFAULT_TIMEZONE,
      changedAt: entry.changedAt,
      version: '0.0.0',
      type: entry.kind,
      area: entry.area,
      title: entry.title,
      request: entry.summary,
      changes,
      changedBy: entry.changedBy,
      database: { migrations: [] },
      validation: {
        unitTests: false,
        integrationTests: false,
        e2eTests: false,
        typeCheck: false,
        lint: false,
        build: false,
        notes: 'Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.',
      },
      breakingChange: false,
    };
  });

  const doc = {
    project: 'ashburton-baptist-church',
    name: 'Ashburton Baptist Church',
    formatVersion: 1,
    timezone: DEFAULT_TIMEZONE,
    versionSource: 'package.json',
    entries,
  };

  writeChangelogFiles(doc, root);
  console.log(`Imported ${entries.length} historical changelog entries.`);
} finally {
  if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
}
