# Responsive changes (Phase 5)

Ticket: `d4109d17-3b07-4477-968e-f80d825a2aeb`  
App: Ashburton Baptist Church website (Vite 6 + React 18 + TypeScript, `HashRouter`)  
Reported: 21 September 2026 (Pacific/Auckland)

This is the close-out report for the mobile/tablet layout work. It describes **what was actually implemented**, not the original wish-list.

Related documents:

- `RESPONSIVE_AUDIT.md` — Phase 1 inventory (written before layout work)
- `RESPONSIVE_DEVICE_MATRIX.md` — Phase 4 Chrome viewport results

Changelog IDs for this ticket: `CHG-2026-2109-025` (Phase 0–1), `CHG-2026-2109-038` (Phase 2), `CHG-2026-2109-044` (Phase 3), `CHG-2026-2109-045` (Phase 4), `CHG-2026-2109-046` (this report).

`HashRouter` was not changed. Auth, Supabase, Edge Functions, and routing logic were not changed except where a presentational wrapper was added around existing login UI.

---

## What we decided (plain language)

The audit asked five questions. Those were answered for the best phone/tablet fit:

1. **Keep a hamburger on tablets** — the full desktop menu is too tight below 1280px. After Phase 4, the hamburger stays until **`xl` (1280px)**. (Phase 2 first used 1024px; 1024px screens still cramped the bar.)
2. **Show the menu on leadership bios** — people can leave a pastor’s page without the browser Back button.
3. **Do not hide sideways overflow on `body`** — wrap text instead; `html { overflow-x: clip }` is only a last-resort guard.
4. **Leave unused `primary` / `secondary` / `base` colour tokens** — they were never wired up.
5. **Ignore unrouted Photos pages** — they are not in the live menu.

---

## Phase summary

| Phase | What happened |
| --- | --- |
| 0 | Tailwind Play CDN removed. Styles compile with Tailwind 3.4.19 + PostCSS + Autoprefixer. |
| 1 | `RESPONSIVE_AUDIT.md` written; layout work waited for approval. |
| 2 | Viewport, fluid type, shared gutters, safe-area padding, `100dvh` with `100vh` fallback. |
| 3 | Menus (focus trap, Escape, scroll lock), login screens, dialogs as sheets, tables, PDFs. |
| 4 | 194 public Chrome viewport checks; 0 overflow fails; hamburger moved to 1280px. |
| 5 | This file. |

---

## Files changed, and why

### Pipeline and global CSS (Phase 0–2)

| File | Why |
| --- | --- |
| `index.html` | Dropped the Tailwind CDN. Viewport is `width=device-width, initial-scale=1, viewport-fit=cover`. Zoom is still allowed. |
| `index.tsx` | Imports compiled `index.css`. |
| `index.css` | `@tailwind` layers, page gutters, fluid headings, `100vh`/`100dvh`, safe areas, `html` overflow clip. |
| `tailwind.config.js` | CDN theme (gold, charcoal, palettes, fluid `fontSize`). |
| `postcss.config.js` | PostCSS + Autoprefixer. |
| `package.json` / `package-lock.json` | Tailwind 3.4.19, PostCSS, Autoprefixer; SemVer for this ticket. |
| `.gitignore` | Ignores `.phase4-output/` screenshots. |

### New presentational helpers

| File | Why |
| --- | --- |
| `components/UI/PageContainer.tsx` | Shared 16 / 24 / 32px gutters. |
| `components/UI/AuthPageShell.tsx` | Login-family screens: padding, notch, keyboard room. |
| `components/UI/TableScroll.tsx` | Labelled sideways scroll for wide admin tables on phones. |
| `components/UI/useFocusTrap.ts` | Tab trap, Escape, body scroll lock for drawers and dialogs. |
| `components/UI/useMediaQuery.ts` | Viewport queries (PDF download card, portal drawer trap). |
| `scripts/responsive/phase4-device-check.mjs` | Repeatable Chrome viewport check (needs `playwright-core` locally; not a product dependency). |

### Chrome and dialogs

| File | Why |
| --- | --- |
| `components/Layouts/PublicLayout.tsx` | Hamburger until 1280px; 44px targets; full-screen menu; focus trap / Escape / scroll lock; menu on bios; footer accordion 44px; Log in chip large enough to tap. |
| `components/Layouts/DashboardLayout.tsx` | Safe-area height; 44px nav; drawer trap / Escape / close on route. |
| `components/Layouts/AdminLayout.tsx` | Same as member portal chrome. |
| `components/Layouts/PortalTopBar.tsx` | 44px menu / bell / help; search `text-base`; user menu clamped to the viewport; `aria-expanded` for the mobile drawer. |
| `components/UI/Modal.tsx` | Bottom sheet below `md`; safe-area; focus trap / Escape. |
| `components/UI/AppDialogHost.tsx` | Same sheet + trap / Escape. |
| `components/UI/PasswordInput.tsx` | 44px show/hide control. |
| `components/UI/TurnstileField.tsx` | Horizontal scroll if the CAPTCHA is wider than the card. |
| `components/UI/DocumentReaderPanel.tsx` | On phones: Open PDF / Read here instead of a cramped inline viewer. |
| `components/UI/PageHeader.tsx` | Uses `page-container`. |
| `components/sermons/YouTubeSermonCatalog.tsx` | 16:9 frames `min-w-0 overflow-hidden` so they stay in the card. |

### Public pages

| File | Why |
| --- | --- |
| `pages/public/Home.tsx`, `About.tsx` | Fluid hero; vision labels wrap below `md`. |
| `pages/public/History.tsx`, `Vision.tsx`, `StatementOfFaith.tsx`, `Events.tsx`, `EventDetail.tsx`, `ImNew.tsx`, `Giving.tsx`, `NeedPrayer.tsx`, `Contact.tsx` | `hero-title` + `page-container`. Contact helper text wraps. |
| `pages/public/events/*`, `ministries/*`, `leadership/LeadershipBio.tsx` | Same hero/gutter pattern; bio pages keep the hamburger. |
| `pages/public/Login.tsx`, `ResetPassword.tsx` | `AuthPageShell`; stacked names on phones; 16px fields. |
| `components/Auth/MfaChallenge.tsx` | Same shell; looser letter-spacing on the code field on phones. |
| `pages/public/LoginError.tsx`, `OAuthCallback.tsx`, `OAuthCallbackWrapper.tsx` | Real background colour (the old `bg-base` / `bg-secondary` tokens did not exist). |
| `pages/dashboard/PendingApproval.tsx` | Lines wrap; `100dvh` shell. |

### Admin / member surfaces (layout only)

| File | Why |
| --- | --- |
| `pages/admin/AdminUsers.tsx`, `AdminRoles.tsx`, `AdminTeam.tsx`, `AdminEmails.tsx`, `AdminLogs.tsx`, `AdminEvents.tsx`, `AdminSettings.tsx` | `TableScroll` + swipe hint. |
| `pages/admin/AdminTeam.tsx` | Also aliases Lucide `User` → `UserIcon` so Vite can compile (name clash with the `User` type). |
| `pages/admin/CreateUserProfile.tsx` | Name fields stack below `sm`. |
| `pages/admin/AdminRoster.tsx`, `pages/dashboard/Roster.tsx` | Phone: Open PDF; iframe preview from `md` up. |

---

## What we could not (or did not) fix

| Item | Why |
| --- | --- |
| Member and admin pages on a real signed-in phone | Phase 4 ran without a login session. Those routes redirect to `/login`. |
| Admin tables as stacked cards | Spec allowed labelled scroll **or** cards. Scroll keeps columns and actions; cards would be a larger UX rewrite. |
| Unrouted `Photos` / `AdminPhotos` | Not in the live menu; left alone on purpose. |
| `bg-primary` / `bg-secondary` / `bg-base` on unused `Button` / `GlassButton` | Tokens were never in the theme. Login-error/OAuth were given a real green instead. |
| `font-raleway` | Still referenced, still not loaded; text falls back to Inter. Pre-existing. |
| Falling-heart animation `50vh` / `100vh` | Decorative; changing it is unrelated to overflow we were fixing. |
| Event images without `srcset` | Needs Storage transform URLs; that is extra product work, not layout CSS. |
| `prefers-reduced-motion` on blobs / hearts / Tailwind `animate-*` | Only `.animate-on-scroll` honours it today. |
| Physical iPhone / iPad in a hand | Checks used headless Chrome viewports. |
| HashRouter / auth / Supabase / Edge Functions | Out of scope unless asked. |

---

## Follow-up we recommend

1. Sign in on a real phone and walk Overview, Users, Logs, Newsletter PDF, and Roster.
2. If staff still find tables hard, add stacked cards **in addition to** the swipe table.
3. Either load Raleway or drop `font-raleway` classes.
4. Extend `prefers-reduced-motion` to blobs and falling hearts.
5. Add `srcset` / sizes for event photos if Lighthouse image size becomes a problem.
6. Spot-check 200% zoom on Contact and admin tables (Phase 4 only did Home and Login).

---

## Validation actually run

- `npm run validate`
- `npm test` (74 tests)
- `npm run build` (`vite build`)
- Phase 4: 194 public Chrome loads, 0 overflow fails (`RESPONSIVE_DEVICE_MATRIX.md`)

Typecheck still fails on **pre-existing** app errors not introduced by this ticket.
