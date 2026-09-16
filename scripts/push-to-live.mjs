#!/usr/bin/env node
/**
 * Stage, commit, and push to origin/main.
 * Commit message: updates changelogs DDMMYYYY (Pacific/Auckland).
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

if (git(['add', '.']) !== 0) process.exit(1);

const status = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8', shell: false });
const hasChanges = Boolean(status.stdout && status.stdout.trim());
const message = `updates changelogs ${aucklandDdMmYyyy()}`;

if (hasChanges) {
  const committed = git(['commit', '-m', message]);
  if (committed !== 0) process.exit(committed);
} else {
  console.log('Nothing new to commit. Pushing current branch.');
}

process.exit(git(['push', '-u', 'origin', 'main']));
