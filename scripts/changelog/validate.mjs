#!/usr/bin/env node
import fs from 'node:fs';
import {
  changelogMarkdownPath,
  collectSqlFiles,
  fail,
  loadChangelog,
  loadPackageVersion,
  validateChangelogDocument,
} from './lib.mjs';

const root = process.cwd();
const doc = loadChangelog(root);
const markdown = fs.readFileSync(changelogMarkdownPath(root), 'utf8');
const errors = validateChangelogDocument(doc, {
  packageVersion: loadPackageVersion(root),
  sqlFiles: collectSqlFiles(root),
  markdown,
});

process.exit(
  fail(errors, { okMessage: 'CHANGELOG.md and CHANGELOG.json are valid and synchronized.' })
);
