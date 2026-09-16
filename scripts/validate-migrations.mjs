#!/usr/bin/env node
import {
  collectSqlFiles,
  fail,
  loadChangelog,
  resolveMigrationFile,
  sqlLooksDestructive,
  validateMigrationsLayout,
} from './changelog/lib.mjs';

const root = process.cwd();
const errors = validateMigrationsLayout(root);
const sqlFiles = collectSqlFiles(root);
const doc = loadChangelog(root);

for (const [index, entry] of (doc.entries ?? []).entries()) {
  const migrations = entry?.database?.migrations ?? [];
  for (const migration of migrations) {
    const resolved = resolveMigrationFile(migration, sqlFiles);
    if (!resolved) {
      errors.push(`entries[${index}] (${entry.id}) references missing migration "${migration}"`);
      continue;
    }
    if (sqlLooksDestructive(resolved) && entry.database?.destructive !== true) {
      errors.push(
        `entries[${index}] (${entry.id}) migration "${migration}" looks destructive but database.destructive is not true`
      );
    }
  }
}

process.exit(
  fail(errors, { okMessage: 'Migration references and supabase/migrations filenames are valid.' })
);
