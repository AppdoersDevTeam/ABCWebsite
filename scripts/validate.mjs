#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scripts = [
  ['node', ['scripts/changelog/validate.mjs']],
  ['node', ['scripts/validate-version.mjs']],
  ['node', ['scripts/validate-migrations.mjs']],
  ['node', ['scripts/changelog/require-on-code-change.mjs']],
];

let failed = false;
for (const [command, args] of scripts) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: false });
  if (result.status !== 0) failed = true;
}

if (failed) {
  console.error('\nValidation failed.');
  process.exit(1);
}

console.log('\nAll validation checks passed.');
