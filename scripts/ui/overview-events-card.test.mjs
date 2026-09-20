import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const overview = readFileSync(join(root, 'pages/admin/AdminOverview.tsx'), 'utf8');
const layout = readFileSync(join(root, 'components/Layouts/AdminLayout.tsx'), 'utf8');

test('overview Events card uses the left-menu Events icon and counts all events', () => {
  assert.match(layout, /label: EVENTS_LABEL[\s\S]*icon: <Calendar /);
  assert.match(overview, /setEventsCount\(eventsTotal \|\| 0\)/);
  assert.match(overview, /label: EVENTS_LABEL[\s\S]*icon: <Calendar size=\{20\} \/>/);
  assert.match(overview, /\.from\('events'\)[\s\S]*count: 'exact'/);
});
