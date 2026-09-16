#!/usr/bin/env node
import { execSync } from 'node:child_process';
import {
  changelogUpdated,
  fail,
  filesRequiringChangelog,
} from './lib.mjs';

function sh(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function unique(files) {
  return [...new Set(files.map((file) => file.trim()).filter(Boolean))];
}

function changedFiles() {
  if (process.env.CI && process.env.GITHUB_EVENT_NAME === 'pull_request') {
    const base = process.env.GITHUB_BASE_REF || 'main';
    return unique(sh(`git diff --name-only origin/${base}...HEAD`).split('\n'));
  }
  if (process.env.CI) {
    const before = process.env.GITHUB_EVENT_BEFORE;
    if (before && !/^0+$/.test(before)) {
      return unique(sh(`git diff --name-only ${before}...HEAD`).split('\n'));
    }
    return unique(sh('git diff --name-only HEAD~1...HEAD').split('\n'));
  }

  const unstaged = sh('git diff --name-only');
  const staged = sh('git diff --cached --name-only');
  const vsHead = sh('git diff --name-only HEAD');
  const untracked = sh('git ls-files --others --exclude-standard');
  return unique([unstaged, staged, vsHead, untracked].join('\n').split('\n'));
}

const files = changedFiles();
const requiring = filesRequiringChangelog(files);

if (requiring.length === 0) {
  console.log('No application files changed; changelog update not required.');
  process.exit(0);
}

if (changelogUpdated(files)) {
  console.log('CHANGELOG.json updated for application changes.');
  process.exit(0);
}

process.exit(
  fail([
    'Application files changed without updating CHANGELOG.json.',
    `Changed files: ${requiring.join(', ')}`,
    'Create a Change ID (npm run changelog:next-id), update CHANGELOG.json, then npm run changelog:render.',
  ])
);
