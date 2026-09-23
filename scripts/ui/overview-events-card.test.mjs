import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const overview = readFileSync(join(root, 'pages/admin/AdminOverview.tsx'), 'utf8');
const layout = readFileSync(join(root, 'components/Layouts/AdminLayout.tsx'), 'utf8');
const bundle = readFileSync(join(root, 'lib/adminOverviewBundle.ts'), 'utf8');

test('overview Events card uses the left-menu Events icon and counts all events', () => {
  assert.match(layout, /label: EVENTS_LABEL[\s\S]*icon: <Calendar /);
  assert.match(overview, /label: EVENTS_LABEL[\s\S]*icon: <Calendar size=\{20\} \/>/);
  // Counts all events via RPC bundle and/or fallback head count
  assert.match(bundle, /events_count/);
  assert.match(overview, /setEventsCount\(bundle\.events_count\)/);
  assert.match(overview, /\.from\('events'\)[\s\S]*count: 'exact'/);
  assert.match(overview, /setEventsCount\(eventsResult\.value\.count \|\| 0\)/);
});
