#!/usr/bin/env node
import { fail, loadChangelog, loadPackageVersion, SEMVER_RE } from './changelog/lib.mjs';

const version = loadPackageVersion();
const errors = [];

if (!SEMVER_RE.test(version)) {
  errors.push(`package.json version "${version}" is not valid MAJOR.MINOR.PATCH`);
}

const doc = loadChangelog();
const latest = doc.entries?.[0];
if (!latest) {
  errors.push('CHANGELOG.json has no entries');
} else if (latest.version !== version) {
  errors.push(
    `package.json version ${version} does not match latest changelog entry ${latest.id} (${latest.version})`
  );
}

process.exit(fail(errors, { okMessage: `Semantic version ${version} matches the latest changelog entry.` }));
