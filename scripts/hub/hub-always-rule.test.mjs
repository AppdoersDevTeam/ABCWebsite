import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const ALWAYS_APPLY_HUB_RULES = [
  '.cursor/rules/hub-always.mdc',
  '.cursor/rules/hub-session-start.mdc',
  '.cursor/rules/hub-workflow-enforcement.mdc',
  '.cursor/rules/hub-project-map.mdc',
  '.cursor/rules/hub-agent-behavior.mdc',
  '.cursor/rules/agent-completion-checklist.mdc',
  '.cursor/rules/commit-messages.mdc',
];

test('Hub always-apply rules exist and are always applied', () => {
  for (const relativePath of ALWAYS_APPLY_HUB_RULES) {
    const fullPath = path.join(repoRoot, relativePath);
    assert.equal(fs.existsSync(fullPath), true, `missing ${relativePath}`);
    const contents = fs.readFileSync(fullPath, 'utf8');
    assert.match(contents, /^---[\s\S]*alwaysApply:\s*true[\s\S]*---/m, `${relativePath} must be alwaysApply`);
  }
});

test('hub-always.mdc forbids skipping Hub and requires CLI-only tickets', () => {
  const contents = fs.readFileSync(path.join(repoRoot, '.cursor/rules/hub-always.mdc'), 'utf8');
  assert.match(contents, /Do not skip it because a folder looks unrelated/);
  assert.match(contents, /node tools\/hub-workflow-cli\.mjs/);
  assert.match(contents, /Never call Hub HTTP endpoints/);
  assert.match(contents, /AskQuestion/);
  assert.match(contents, /flush-ticket-time/);
  assert.match(contents, /0\.1/);
});

test('agent-completion-checklist requires flush and work-based commits', () => {
  const contents = fs.readFileSync(
    path.join(repoRoot, '.cursor/rules/agent-completion-checklist.mdc'),
    'utf8'
  );
  assert.match(contents, /flush-ticket-time/);
  assert.match(contents, /0\.1/);
  assert.match(contents, /type\(scope\):/);
  assert.match(contents, /updates changelogs/);
});

test('commit-messages.mdc forbids generic changelog subjects', () => {
  const contents = fs.readFileSync(path.join(repoRoot, '.cursor/rules/commit-messages.mdc'), 'utf8');
  assert.match(contents, /alwaysApply:\s*true/);
  assert.match(contents, /updates changelogs DDMMYYYY/);
  assert.match(contents, /push:live/);
});

test('ticket hook fails closed so edits cannot bypass Hub', () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(repoRoot, '.cursor/hooks.json'), 'utf8'));
  const hubHook = hooks.hooks.preToolUse.find((hook) =>
    String(hook.command || '').includes('require-hub-ticket')
  );
  assert.ok(hubHook, 'require-hub-ticket hook must exist');
  assert.equal(hubHook.failClosed, true);
});

test('sessionStart Hub hook is registered for every clone', () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(repoRoot, '.cursor/hooks.json'), 'utf8'));
  const startHook = (hooks.hooks.sessionStart || []).find((hook) =>
    String(hook.command || '').includes('hub-session-start')
  );
  assert.ok(startHook, 'hub-session-start hook must exist');
  assert.equal(fs.existsSync(path.join(repoRoot, '.cursor/hooks/hub-session-start.mjs')), true);
});

test('teammate laptop Hub setup is in the repo', () => {
  assert.equal(fs.existsSync(path.join(repoRoot, 'HUB-SETUP.md')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'tools/setup-hub-token.mjs')), true);
  const setup = fs.readFileSync(path.join(repoRoot, 'HUB-SETUP.md'), 'utf8');
  assert.match(setup, /Once per person, per laptop/);
  assert.match(setup, /node tools\/setup-hub-token\.mjs/);
});

test('project Hub skill is present for every clone', () => {
  const skillPath = path.join(repoRoot, '.cursor/skills/appdoers-hub/SKILL.md');
  assert.equal(fs.existsSync(skillPath), true);
  const contents = fs.readFileSync(skillPath, 'utf8');
  assert.match(contents, /Use on EVERY request in this repository/);
  assert.match(contents, /node tools\/hub-workflow-cli\.mjs/);
});
