#!/usr/bin/env node
/**
 * Stage, commit, and push to origin/main.
 *
 * Commit message MUST describe the work done.
 * Prefer: npm run push:live -- "type(scope): description [CHG-ID]"
 * Or set PUSH_LIVE_MESSAGE. Never use a generic changelog-only subject.
 */
import { spawnSync } from 'node:child_process';

function aucklandDdMmYyyy() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Pacific/Auckland',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('day')}${get('month')}${get('year')}`;
}

function git(args) {
  const result = spawnSync('git', args, { stdio: 'inherit', shell: false });
  return result.status ?? 1;
}

/** Args after `--` from npm, or env PUSH_LIVE_MESSAGE. */
function resolveCommitMessage() {
  const fromEnv = (process.env.PUSH_LIVE_MESSAGE || '').trim();
  if (fromEnv) return fromEnv;

  const argvMsg = process.argv.slice(2).join(' ').trim();
  if (argvMsg) return argvMsg;

  console.error(`
push:live requires a work-based commit message.

  npm run push:live -- "type(scope): what you changed [CHG-YYYY-DDMM-NNN]"

Or set PUSH_LIVE_MESSAGE. Do not use a generic "updates changelogs" subject.
`);
  process.exit(1);
}

if (git(['add', '.']) !== 0) process.exit(1);

const status = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8', shell: false });
const hasChanges = Boolean(status.stdout && status.stdout.trim());
const message = resolveCommitMessage();

// Soft guard: refuse obvious generic subjects
const generic = /^updates\s+changelogs\s+\d{8}$/i;
if (generic.test(message.trim())) {
  console.error(
    'Refusing generic commit message. Describe the work done, e.g. "perf(admin): cut dashboard Supabase requests [CHG-...]"'
  );
  process.exit(1);
}

if (hasChanges) {
  const committed = git(['commit', '-m', message]);
  if (committed !== 0) process.exit(committed);
  console.log(`Committed: ${message}`);
} else {
  console.log('Nothing new to commit. Pushing current branch.');
}

// Date stamp is only for operator log — not the commit subject
console.log(`Pushing to origin/main (${aucklandDdMmYyyy()} Auckland).`);
process.exit(git(['push', '-u', 'origin', 'main']));
