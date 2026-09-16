#!/usr/bin/env node
import { loadChangelog, writeChangelogFiles } from './lib.mjs';

const doc = loadChangelog();
writeChangelogFiles(doc);
console.log('Wrote CHANGELOG.json and CHANGELOG.md');
