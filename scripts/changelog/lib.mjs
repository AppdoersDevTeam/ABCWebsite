/**
 * Development changelog helpers.
 * CHANGELOG.json is canonical. CHANGELOG.md is generated from it.
 */

import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_TIMEZONE = 'Pacific/Auckland';
export const FORMAT_VERSION = 1;

export const CHANGE_ID_RE = /^CHG-(\d{4})-(\d{2})(\d{2})-(\d{3})$/;
export const LEGACY_ID_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/;
export const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^\d{2}:\d{2}:\d{2}$/;

export const CHANGE_TYPES = [
  'added',
  'changed',
  'fixed',
  'removed',
  'security',
  'performance',
  'refactored',
  'documentation',
  'infrastructure',
];

export const CHANGE_AREAS = [
  'admin',
  'auth',
  'calendar',
  'devotionals',
  'events',
  'leadership',
  'newsletters',
  'prayer',
  'public',
  'roster',
  'sermons',
  'system',
  'users',
];

export const VALIDATION_KEYS = [
  'unitTests',
  'integrationTests',
  'e2eTests',
  'typeCheck',
  'lint',
  'build',
];

export const TYPE_LABELS = {
  added: 'Added',
  changed: 'Changed',
  fixed: 'Fixed',
  removed: 'Removed',
  security: 'Security',
  performance: 'Performance',
  refactored: 'Refactored',
  documentation: 'Documentation',
  infrastructure: 'Infrastructure',
};

const DESTRUCTIVE_SQL_RE =
  /\b(DROP\s+(TABLE|COLUMN|DATABASE|SCHEMA|INDEX|VIEW|FUNCTION|TRIGGER)|TRUNCATE\s+TABLE)\b/i;

export function repoRoot(from = process.cwd()) {
  return from;
}

export function changelogJsonPath(root = repoRoot()) {
  return path.join(root, 'CHANGELOG.json');
}

export function changelogMarkdownPath(root = repoRoot()) {
  return path.join(root, 'CHANGELOG.md');
}

export function packageJsonPath(root = repoRoot()) {
  return path.join(root, 'package.json');
}

export function migrationsDir(root = repoRoot()) {
  return path.join(root, 'supabase', 'migrations');
}

export function formatInTimeZone(date, timeZone = DEFAULT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}:${get('second')}`,
    timezone: timeZone,
    changedAt: date.toISOString(),
  };
}

export function nowStamp(timeZone = DEFAULT_TIMEZONE) {
  return formatInTimeZone(new Date(), timeZone);
}

export function parseChangeId(id) {
  const match = CHANGE_ID_RE.exec(id);
  if (!match) return null;
  const day = Number(match[2]);
  const month = Number(match[3]);
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  return {
    year: match[1],
    ddmm: `${match[2]}${match[3]}`,
    n: Number(match[4]),
  };
}

export function formatChangeId(yyyy, ddmm, n) {
  return `CHG-${yyyy}-${ddmm}-${String(n).padStart(3, '0')}`;
}

export function changeIdDateKey(stamp) {
  const [year, month, day] = String(stamp.date).split('-');
  return {
    year,
    ddmm: `${day}${month}`,
  };
}

export function nextChangeId(entries, stamp = nowStamp()) {
  const { year, ddmm } = changeIdDateKey(stamp);
  const prefix = `CHG-${year}-${ddmm}-`;
  let max = 0;
  for (const entry of entries ?? []) {
    if (typeof entry?.id !== 'string' || !entry.id.startsWith(prefix)) continue;
    const parsed = parseChangeId(entry.id);
    if (parsed && parsed.n > max) max = parsed.n;
  }
  return formatChangeId(year, ddmm, max + 1);
}

export function isValidChangeId(id) {
  return Boolean(parseChangeId(id)) || LEGACY_ID_RE.test(id);
}

export function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

export function readJsonFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return { text, data: JSON.parse(text) };
}

export function loadChangelog(root = repoRoot()) {
  return readJsonFile(changelogJsonPath(root)).data;
}

export function loadPackageVersion(root = repoRoot()) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath(root), 'utf8'));
  return pkg.version;
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeNewlines(text) {
  return String(text ?? '').replace(/\r\n/g, '\n');
}

export function renderValidationLine(key, value) {
  const labels = {
    unitTests: 'Unit tests',
    integrationTests: 'Integration tests',
    e2eTests: 'End-to-end tests',
    typeCheck: 'Type checking',
    lint: 'Lint',
    build: 'Build',
  };
  const label = labels[key] ?? key;
  if (value === true) return `* ${label}: passed`;
  if (value === false) return `* ${label}: not run or failed`;
  return `* ${label}: ${String(value)}`;
}

export function renderDatabaseLines(database) {
  const migrations = database?.migrations ?? [];
  if (!Array.isArray(migrations) || migrations.length === 0) return ['* None'];
  return migrations.map((name) => `* ${name}`);
}

export function renderChangelogMarkdown(doc) {
  const lines = [
    '# Changelog',
    '',
    'Human-readable development history for **Ashburton Baptist Church**.',
    '',
    'The machine-readable source of truth is `CHANGELOG.json`. Newest entries appear first.',
    'Never delete historical entries. Never rewrite historical entries unless explicitly correcting them.',
    '',
    `Timezone for new entries: **${doc.timezone ?? DEFAULT_TIMEZONE}**. Authoritative version: \`package.json\`.`,
    '',
  ];

  for (const entry of doc.entries ?? []) {
    const typeLabel = TYPE_LABELS[entry.type] ?? entry.type;
    lines.push(`## ${entry.id} — ${entry.title}`, '');
    lines.push(`**Date:** ${entry.date}`);
    lines.push(`**Time:** ${entry.time}`);
    lines.push(`**Timezone:** ${entry.timezone}`);
    lines.push(`**Version:** ${entry.version}`);
    lines.push(`**Type:** ${typeLabel}`);
    if (entry.partial) lines.push('**Status:** Partial');
    lines.push('', '**Request**', '');
    lines.push(`> ${String(entry.request ?? '').replace(/\n/g, '\n> ')}`, '');
    lines.push('**Changes**', '');
    for (const change of entry.changes ?? []) {
      lines.push(`* ${change}`);
    }
    lines.push('', '**Database**', '');
    lines.push(...renderDatabaseLines(entry.database), '');
    if (entry.database?.destructive) {
      lines.push('* Destructive: yes — must not be applied silently to production.', '');
    }
    lines.push('**Validation**', '');
    const validation = entry.validation ?? {};
    for (const key of VALIDATION_KEYS) {
      lines.push(renderValidationLine(key, validation[key]));
    }
    if (nonEmptyString(validation.notes)) {
      lines.push(`* Notes: ${validation.notes.trim()}`);
    }
    if (entry.breakingChange) {
      lines.push('* Breaking change: yes');
    }
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

export function collectSqlFiles(root = repoRoot()) {
  const files = new Map();
  const addDir = (dir, prefix = '') => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (!fs.statSync(full).isFile() || !name.toLowerCase().endsWith('.sql')) continue;
      const rel = prefix ? `${prefix}${name}` : name;
      files.set(rel.replaceAll('\\', '/'), full);
      files.set(name, full);
    }
  };
  addDir(root);
  addDir(migrationsDir(root), 'supabase/migrations/');
  return files;
}

export function resolveMigrationFile(name, sqlFiles) {
  const normalized = String(name).replaceAll('\\', '/').replace(/^\.?\//, '');
  const candidates = [
    normalized,
    path.posix.basename(normalized),
    normalized.endsWith('.sql') ? normalized : `${normalized}.sql`,
    `supabase/migrations/${path.posix.basename(normalized)}`,
    `supabase/migrations/${path.posix.basename(normalized)}.sql`,
  ];
  for (const candidate of candidates) {
    if (sqlFiles.has(candidate)) return sqlFiles.get(candidate);
  }
  return null;
}

export function sqlLooksDestructive(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return DESTRUCTIVE_SQL_RE.test(text);
}

export function validateChangelogDocument(doc, options = {}) {
  const errors = [];
  const { packageVersion, sqlFiles = new Map(), markdown } = options;

  if (!doc || typeof doc !== 'object') {
    return ['CHANGELOG.json must contain an object'];
  }
  if (!nonEmptyString(doc.project)) errors.push('project is required');
  if (doc.formatVersion !== FORMAT_VERSION) {
    errors.push(`formatVersion must be ${FORMAT_VERSION}`);
  }
  if (!Array.isArray(doc.entries)) {
    errors.push('entries must be an array');
    return errors;
  }

  const ids = new Set();
  let highestVersion = '0.0.0';

  doc.entries.forEach((entry, index) => {
    const loc = `entries[${index}]`;
    if (!entry || typeof entry !== 'object') {
      errors.push(`${loc} must be an object`);
      return;
    }
    if (!nonEmptyString(entry.id)) {
      errors.push(`${loc}.id is required`);
    } else if (!isValidChangeId(entry.id)) {
      errors.push(`${loc}.id "${entry.id}" is not a valid Change ID`);
    } else if (ids.has(entry.id)) {
      errors.push(`Duplicate Change ID: ${entry.id}`);
    } else {
      ids.add(entry.id);
    }

    if (!DATE_RE.test(entry.date ?? '')) errors.push(`${loc}.date must be YYYY-MM-DD`);
    if (!TIME_RE.test(entry.time ?? '')) errors.push(`${loc}.time must be HH:MM:SS`);
    if (!nonEmptyString(entry.timezone)) errors.push(`${loc}.timezone is required`);
    if (!SEMVER_RE.test(entry.version ?? '')) {
      errors.push(`${loc}.version "${entry.version}" is not a valid semantic version`);
    } else if (compareSemver(entry.version, highestVersion) > 0) {
      highestVersion = entry.version;
    }
    if (!CHANGE_TYPES.includes(entry.type)) {
      errors.push(`${loc}.type "${entry.type}" is not a recognised type`);
    }
    if (!nonEmptyString(entry.title)) errors.push(`${loc}.title is required`);
    if (!nonEmptyString(entry.request)) errors.push(`${loc}.request is required`);
    if (!Array.isArray(entry.changes) || entry.changes.length === 0) {
      errors.push(`${loc}.changes must be a non-empty array`);
    } else if (entry.changes.some((item) => !nonEmptyString(item))) {
      errors.push(`${loc}.changes must contain non-empty strings`);
    }
    if (entry.area && !CHANGE_AREAS.includes(entry.area)) {
      errors.push(`${loc}.area "${entry.area}" is not a recognised area`);
    }
    if (entry.changedBy !== undefined && !nonEmptyString(entry.changedBy)) {
      errors.push(`${loc}.changedBy must be a non-empty string when present`);
    }
    if (typeof entry.breakingChange !== 'boolean') {
      errors.push(`${loc}.breakingChange must be a boolean`);
    }
    if (!entry.database || typeof entry.database !== 'object' || !Array.isArray(entry.database.migrations)) {
      errors.push(`${loc}.database.migrations must be an array`);
    } else {
      for (const migration of entry.database.migrations) {
        if (!nonEmptyString(migration)) {
          errors.push(`${loc}.database.migrations contains an empty value`);
          continue;
        }
        const resolved = resolveMigrationFile(migration, sqlFiles);
        if (!resolved) {
          errors.push(`${loc} references missing migration "${migration}"`);
        } else if (sqlLooksDestructive(resolved) && entry.database.destructive !== true) {
          errors.push(
            `${loc} migration "${migration}" looks destructive but database.destructive is not true`
          );
        }
      }
    }
    if (!entry.validation || typeof entry.validation !== 'object') {
      errors.push(`${loc}.validation is required`);
    } else {
      for (const key of VALIDATION_KEYS) {
        if (typeof entry.validation[key] !== 'boolean') {
          errors.push(`${loc}.validation.${key} must be a boolean`);
        }
      }
    }
  });

  if (doc.entries.length > 0) {
    const latest = doc.entries[0];
    if (packageVersion && latest.version !== packageVersion) {
      errors.push(
        `Latest changelog version ${latest.version} does not match package.json version ${packageVersion}`
      );
    }
    if (packageVersion && highestVersion !== packageVersion) {
      errors.push(
        `Highest changelog version ${highestVersion} does not match package.json version ${packageVersion}`
      );
    }
  } else if (packageVersion) {
    errors.push('CHANGELOG.json has no entries; cannot verify package version');
  }

  if (markdown !== undefined) {
    const expected = renderChangelogMarkdown(doc);
    if (normalizeNewlines(markdown) !== normalizeNewlines(expected)) {
      errors.push('CHANGELOG.md is out of sync with CHANGELOG.json. Run npm run changelog:render');
    }
  }

  return errors;
}

export function validateMigrationsLayout(root = repoRoot()) {
  const errors = [];
  const dir = migrationsDir(root);
  if (!fs.existsSync(dir)) return errors;
  const names = fs.readdirSync(dir).filter((name) => name.toLowerCase().endsWith('.sql'));
  const seen = new Set();
  for (const name of names) {
    if (seen.has(name)) errors.push(`Duplicate migration filename: ${name}`);
    seen.add(name);
    if (!/^\d{14}_[a-z0-9_]+\.sql$/i.test(name) && name !== '.gitkeep') {
      errors.push(
        `Migration "${name}" should use supabase/migrations/YYYYMMDDHHMMSS_description.sql`
      );
    }
  }
  return errors;
}

const CODE_CHANGE_EXEMPT = new Set(['CHANGELOG.md', 'CHANGELOG.json']);

export function isExemptFromChangelogRequirement(file) {
  const normalized = file.replaceAll('\\', '/');
  if (CODE_CHANGE_EXEMPT.has(normalized)) return true;
  if (normalized.startsWith('tickets/')) return true;
  if (normalized === 'BOARD.md') return true;
  return false;
}

export function filesRequiringChangelog(changedFiles) {
  return changedFiles
    .map((file) => file.replaceAll('\\', '/'))
    .filter((file) => file && !isExemptFromChangelogRequirement(file));
}

export function changelogUpdated(changedFiles) {
  return changedFiles.some((file) => file.replaceAll('\\', '/') === 'CHANGELOG.json');
}

export function writeChangelogFiles(doc, root = repoRoot()) {
  const jsonPath = changelogJsonPath(root);
  const mdPath = changelogMarkdownPath(root);
  fs.writeFileSync(jsonPath, `${JSON.stringify(doc, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderChangelogMarkdown(doc));
}

export function fail(errors, { okMessage } = {}) {
  if (!errors.length) {
    if (okMessage) console.log(okMessage);
    return 0;
  }
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  return 1;
}
