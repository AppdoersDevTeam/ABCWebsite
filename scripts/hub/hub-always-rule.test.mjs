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
});

test('ticket hook fails closed so edits cannot bypass Hub', () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(repoRoot, '.cursor/hooks.json'), 'utf8'));
  const hubHook = hooks.hooks.preToolUse.find((hook) =>
    String(hook.command || '').includes('require-hub-ticket')
  );
  assert.ok(hubHook, 'require-hub-ticket hook must exist');
  assert.equal(hubHook.failClosed, true);
});

test('project Hub skill is present for every clone', () => {
  const skillPath = path.join(repoRoot, '.cursor/skills/appdoers-hub/SKILL.md');
  assert.equal(fs.existsSync(skillPath), true);
  const contents = fs.readFileSync(skillPath, 'utf8');
  assert.match(contents, /Use on EVERY request in this repository/);
  assert.match(contents, /node tools\/hub-workflow-cli\.mjs/);
});
