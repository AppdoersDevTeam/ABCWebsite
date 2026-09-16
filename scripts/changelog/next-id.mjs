#!/usr/bin/env node
import { loadChangelog, nextChangeId, nowStamp } from './lib.mjs';

const stamp = nowStamp();
const doc = loadChangelog();
const id = nextChangeId(doc.entries, stamp);

const payload = {
  id,
  ...stamp,
};

console.log(JSON.stringify(payload, null, 2));
