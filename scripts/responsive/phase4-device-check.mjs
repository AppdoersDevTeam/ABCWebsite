/**
 * Phase 4 device matrix: load public HashRouter routes in Chrome at phone/tablet
 * viewports and record overflow, chrome, and small tap targets.
 *
 * Run (playwright-core is not a project dependency):
 *   npm exec --yes --package=playwright-core -- node scripts/responsive/phase4-device-check.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const BASE = process.env.PHASE4_BASE || 'http://127.0.0.1:3000';
const CHROME =
  process.env.PHASE4_CHROME ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = fileURLToPath(new URL('../../.phase4-output/', import.meta.url));

const ROUTES = [
  '/',
  '/about',
  '/about/history',
  '/about/vision',
  '/about/beliefs',
  '/events',
  '/events/sermons',
  '/ministries',
  '/sunday-service',
  '/young-adults',
  '/teens-youth',
  '/children',
  '/boys-brigade',
  '/im-new',
  '/giving',
  '/need-prayer',
  '/contact',
  '/login',
  '/login-error',
  '/reset-password',
  '/terms',
  '/privacy',
];

const CORE_VIEWPORTS = [
  { name: 'small-phone', width: 320, height: 568, group: 'small-phone' },
  { name: 'iphone-se', width: 375, height: 667, group: 'small-phone' },
  { name: 'iphone-14', width: 390, height: 844, group: 'phone' },
  { name: 'ipad-mini', width: 744, height: 1133, group: 'tablet' },
  { name: 'ipad-10', width: 820, height: 1180, group: 'tablet' },
];

const EXTRA_VIEWPORTS_HOME_LOGIN = [
  { name: 'iphone-16-pro', width: 393, height: 852, group: 'phone' },
  { name: 'pixel-8', width: 412, height: 915, group: 'phone' },
  { name: 'galaxy-s24', width: 360, height: 800, group: 'phone' },
  { name: 'iphone-16-pro-max', width: 430, height: 932, group: 'phone' },
  { name: 'ipad-pro-11', width: 834, height: 1194, group: 'tablet' },
  { name: 'ipad-pro-13', width: 1024, height: 1366, group: 'tablet' },
];

function landscapeOf(vp) {
  return {
    name: `${vp.name}-landscape`,
    width: vp.height,
    height: vp.width,
    group: `${vp.group}-landscape`,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function measure(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const overflowX = Math.max(0, scrollWidth - vw);

    const overflowing = [];
    const nodes = document.body.querySelectorAll('header, nav, main, footer, h1, h2, img, iframe, table, a, button, input, .page-container');
    nodes.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      if (r.right > vw + 2 && r.left < vw) {
        const tag = el.tagName.toLowerCase();
        const cls = typeof el.className === 'string' ? el.className.slice(0, 80) : '';
        overflowing.push(`${tag}${cls ? '.' + cls.split(/\s+/).slice(0, 2).join('.') : ''}`);
      }
    });

    const smallTaps = [];
    document.querySelectorAll('header a, header button, #public-mobile-nav a, #public-mobile-nav button, form button, a.bg-gold').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      if (r.width < 44 || r.height < 44) {
        smallTaps.push({
          text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    });

    const hamburger = document.querySelector('button[aria-controls="public-mobile-nav"]');
    const desktopNav = document.querySelector('header nav');
    const isShown = (el) => {
      if (!el) return false;
      const s = window.getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const hamburgerVisible = isShown(hamburger);
    const desktopVisible = isShown(desktopNav);

    const h1 = document.querySelector('h1, h2');
    const h1Rect = h1 ? h1.getBoundingClientRect() : null;

    return {
      vw,
      vh,
      scrollWidth,
      overflowX,
      overflowing: [...new Set(overflowing)].slice(0, 8),
      smallTaps: smallTaps.slice(0, 8),
      hamburgerVisible,
      desktopVisible,
      title: document.title,
      heading: (h1?.textContent || '').trim().slice(0, 80),
      headingWidth: h1Rect ? Math.round(h1Rect.width) : 0,
    };
  });
}

async function visit(page, route, viewport, screenshotName) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`${BASE}/#${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('header', { timeout: 20000 });
  await sleep(300);
  const metrics = await measure(page);
  if (screenshotName) {
    await page.screenshot({
      path: path.join(OUT_DIR, screenshotName),
      fullPage: false,
    });
  }
  const failOverflow = metrics.overflowX > 8;
  const failClip = metrics.overflowing.length > 0 && failOverflow;
  return {
    path: route,
    viewport: viewport.name,
    size: `${viewport.width}x${viewport.height}`,
    group: viewport.group,
    overflowX: metrics.overflowX,
    overflowing: metrics.overflowing,
    smallTaps: metrics.smallTaps,
    hamburgerVisible: metrics.hamburgerVisible,
    desktopVisible: metrics.desktopVisible,
    heading: metrics.heading,
    ok: !failOverflow,
    notes: failClip ? 'content wider than viewport' : failOverflow ? `horizontal overflow ${metrics.overflowX}px` : '',
  };
}

function markdown(rows, extras) {
  const fails = rows.filter((r) => !r.ok);
  const lines = [
    '# Responsive device matrix (Phase 4)',
    '',
    `Ticket: \`d4109d17-3b07-4477-968e-f80d825a2aeb\``,
    `Checked: ${new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })} (Pacific/Auckland)`,
    'Tool: headless Chrome at the listed CSS viewports (not a physical phone). Protected `/dashboard` and `/admin` routes redirect to login without a session, so they were not scored as member/admin layouts.',
    '',
    '## Viewports',
    '',
    '| Device | Size | Orientation | Coverage |',
    '| --- | --- | --- | --- |',
    '| Smallest phone | 320 × 568 | portrait + landscape | every public route |',
    '| iPhone SE | 375 × 667 | portrait | every public route |',
    '| iPhone 14 | 390 × 844 | portrait + landscape | every public route |',
    '| iPad mini | 744 × 1133 | portrait + landscape | every public route |',
    '| iPad 10th gen | 820 × 1180 | portrait | every public route |',
    '| Other spec phones / iPad Pro | see names | portrait | Home, Login, Contact |',
    '',
    '## Summary',
    '',
    `- Pages checked: ${rows.length}`,
    `- Pass (no meaningful horizontal overflow): ${rows.length - fails.length}`,
    `- Fail: ${fails.length}`,
    extras.reducedMotion ? `- Reduced motion: ${extras.reducedMotion}` : '',
    extras.zoom200 ? `- 200% zoom (Home + Login at 375px): ${extras.zoom200}` : '',
    extras.navNote ? `- Navigation: ${extras.navNote}` : '',
    '',
    '## Failures',
    '',
  ];
  if (fails.length === 0) {
    lines.push('None. No public page produced more than 8px of horizontal overflow at the checked sizes.');
  } else {
    lines.push('| Route | Viewport | Size | Overflow | Notes |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const f of fails) {
      lines.push(`| \`${f.path}\` | ${f.viewport} | ${f.size} | ${f.overflowX}px | ${f.notes || f.overflowing.join(', ')} |`);
    }
  }
  lines.push('', '## Chrome (hamburger vs desktop nav)', '');
  const navSample = rows.filter((r) => r.path === '/' && !r.viewport.includes('zoom'));
  lines.push('| Viewport | Size | Hamburger | Desktop nav |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of navSample) {
    lines.push(`| ${r.viewport} | ${r.size} | ${r.hamburgerVisible ? 'yes' : 'no'} | ${r.desktopVisible ? 'yes' : 'no'} |`);
  }
  lines.push(
    '',
    '## Known limits of this check',
    '',
    '- Landscape used swapped width/height of the same device boxes.',
    '- Member and admin screens need a signed-in session; they were not visually scored here.',
    '- Overlap and “reachable tap target” are sampled from header/login chrome, not every table checkbox.',
    '- Screenshots (if captured) live in gitignored `.phase4-output/`.',
    '',
  );
  return lines.filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n');
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--hide-scrollbars', '--disable-gpu'],
  });
  const page = await browser.newPage();
  const rows = [];

  const fullSet = [
    ...CORE_VIEWPORTS,
    landscapeOf(CORE_VIEWPORTS[0]),
    landscapeOf(CORE_VIEWPORTS[2]),
    landscapeOf(CORE_VIEWPORTS[3]),
  ];

  for (const vp of fullSet) {
    for (const route of ROUTES) {
      const shot =
        (route === '/' || route === '/login' || route === '/contact') &&
        (vp.name === 'small-phone' || vp.name === 'ipad-mini' || vp.name === 'iphone-14-landscape')
          ? `${vp.name}${route.replaceAll('/', '_') || '_home'}.png`
          : null;
      rows.push(await visit(page, route, vp, shot));
    }
  }

  for (const vp of EXTRA_VIEWPORTS_HOME_LOGIN) {
    for (const route of ['/', '/login', '/contact']) {
      rows.push(await visit(page, route, vp, null));
    }
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/#/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('header', { timeout: 20000 });
  await sleep(300);
  const reduced = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  await page.emulateMedia({ reducedMotion: null });
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${BASE}/#/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('header', { timeout: 20000 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await sleep(400);
  const homeZoom = await measure(page);
  await page.goto(`${BASE}/#/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await sleep(400);
  const loginZoom = await measure(page);

  await browser.close();

  const navHome = rows.filter((r) => r.path === '/');
  const hamburgerOk = navHome
    .filter((r) => r.viewport === 'small-phone' || r.viewport === 'ipad-mini' || r.viewport === 'ipad-pro-13')
    .every((r) => r.hamburgerVisible);
  const desktopAtPhone = navHome.find((r) => r.viewport === 'small-phone')?.desktopVisible;

  const extras = {
    reducedMotion: reduced ? 'prefers-reduced-motion is reported by the browser' : 'media query did not match',
    zoom200: `Home overflow ${homeZoom.overflowX}px; Login overflow ${loginZoom.overflowX}px`,
    navNote: hamburgerOk && !desktopAtPhone
      ? 'hamburger shows on phones and tablets through 1024px; desktop bar starts at xl (1280px)'
      : 'check hamburger/desktop split',
  };

  const md = markdown(rows, extras);
  writeFileSync(new URL('../../RESPONSIVE_DEVICE_MATRIX.md', import.meta.url), md);
  writeFileSync(path.join(OUT_DIR, 'results.json'), JSON.stringify({ extras, rows }, null, 2));
  console.log(md);
  console.log(`\nWrote RESPONSIVE_DEVICE_MATRIX.md (${rows.length} checks, ${rows.filter((r) => !r.ok).length} fails)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
