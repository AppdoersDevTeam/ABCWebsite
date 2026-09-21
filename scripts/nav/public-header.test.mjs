import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const layout = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../components/Layouts/PublicLayout.tsx'),
  'utf8',
);

test('public header logo sits left of the menu and labels stay on one line', () => {
  assert.match(layout, /Logo — left of the header menu/);
  assert.match(layout, /flex shrink-0 items-center group/);
  assert.match(layout, /label: 'Sermons'/);
  assert.doesNotMatch(layout, /Watch Sermons/);
  assert.match(layout, /label: "I'm New"/);
  assert.match(layout, /whitespace-nowrap text-base font-sans font-bold/);
});

test('public footer Explore menu matches the header including Sermons', () => {
  const footerStart = layout.indexOf('id="footer-explore-links"');
  assert.ok(footerStart > 0);
  const footerChunk = layout.slice(footerStart, footerStart + 900);
  assert.match(footerChunk, /navItems\.map/);
  assert.match(footerChunk, /\{item\.label\}/);
  assert.match(layout, /label: 'Sermons'/);
  assert.match(layout, /path: '\/events\/sermons'/);
});

test('public footer Legal sits tight under the divider like the copyright block', () => {
  assert.match(layout, /border-b border-gray-100 pb-3/);
  assert.doesNotMatch(layout, /border-b border-gray-100 pb-6 mb-6/);
  assert.match(layout, /justify-between items-start text-white text-sm gap-2 pt-3/);
  assert.match(layout, /min-h-\[44px\] md:min-h-0/);
  const legalStart = layout.indexOf('id="footer-legal-links"');
  assert.ok(legalStart > 0);
  const legalChunk = layout.slice(legalStart, legalStart + 400);
  assert.match(legalChunk, /Privacy Policy/);
  assert.match(legalChunk, /Terms & Conditions/);
  assert.doesNotMatch(legalChunk, /gap-2/);
});
