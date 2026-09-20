# Responsive audit (Phase 1)

Ticket: `d4109d17-3b07-4477-968e-f80d825a2aeb`  
Audited: 21 September 2026 (Pacific/Auckland)  
App: Vite 6 + React 18 + TypeScript SPA, `HashRouter`  
CSS: Tailwind 3.4.19 via PostCSS (Phase 0). Previous Play CDN config is preserved in `tailwind.config.js`.

This document is an inventory of **current** layout behaviour. No Phase 2–5 layout work has been applied.

**Do not add `xs: 375px` yet.** Home and About already use a custom `min-[480px]:` variant for vision-card wrapping. That is between 375 and `sm` (640). A named `xs` at 375px is not required by the audit. If we add a named extra breakpoint in Phase 2, `480px` is the one already in use.

---

## Global findings (apply across routes)

### Viewport and chrome
- `index.html` viewport is `width=device-width, initial-scale=1.0`. Missing `viewport-fit=cover`. Zoom is not blocked (`user-scalable=no` / `maximum-scale=1` are absent — keep it that way).
- `body` uses `overflow-x: hidden` (`index.css`). This hides horizontal overflow rather than fixing it. Phase 2 should remove this after root-cause fixes, then optionally re-add as a last-resort guard.
- No `env(safe-area-inset-*)` on the public header, portal top bar, portal sidebar, or most overlays. Only `DocumentReaderPanel` (maximised) pads top/bottom safe areas.
- `min-h-screen` is used on almost every public hero and several auth/loading shells. Portal shells use `h-dvh` with `lg:h-screen`. Mobile browser chrome will still jump on public pages.
- Falling-heart keyframes still use `50vh` / `100vh`.

### Typography
- Body is Inter 16px via `index.css` (good). Many inputs inherit that; some admin/search fields are `text-sm` (14px) and will trigger iOS zoom on focus.
- Hero titles are hardcoded `fontSize: '4.25rem'` (68px) with no clamp and extra letter-spacing via padded words (`Ashburton      Baptist      Church`). Overflow/wrapping at 320px is very likely.
- `PageHeader` uses `text-5xl md:text-7xl lg:text-8xl` with no fluid scale.
- `font-raleway` is used on many public heroes but is **not** loaded and is **not** in the Tailwind config. It currently falls back to Inter/sans. Pre-existing, not caused by Phase 0.
- `font-sans` in config is Open Sans; the document body is Inter. Pre-existing mismatch.

### Navigation
- Public desktop nav is `hidden lg:flex` (collapses below **1024px**, not `md` / 768). Tablet portrait (768–1023) already uses the hamburger.
- Hamburger exists but: no `aria-expanded` / `aria-controls`, no focus trap, no body scroll lock, close button is a bare icon (`<X size={32}/>`) with no 44×44 hit area, overlay is `h-screen` (not `dvh`) and sits under the header (`z-40` vs header `z-50`). Menu does not consistently close on route change (only leadership bios). No Escape handler on the drawer.
- Portal: gold `PortalTopBar` (64px) + off-canvas sidebar `w-72` below `lg`, collapsed `lg:w-[72px]`. Overlay exists. Close control is icon-only. Menu toggle has `aria-pressed` but not `aria-expanded`/`aria-controls`. No focus trap / scroll lock.
- Identity dropdown is `fixed` with a measured `left`; can clip on small screens. Search field is a fixed pixel width (`w-[138px]` → `sm:w-[181px]` → `md:w-[213px]`).

### Shared components that leak into many routes
| Component | Layout | Failures |
| --- | --- | --- |
| `PublicLayout` | Flex column, `min-h-screen`, `overflow-x-hidden`; fixed header; `container mx-auto px-4 sm:px-6 lg:px-8`; footer 1/2/5-col grid | See Navigation. Footer accordion only on small screens (good). `shine-text` class has **no CSS**. Log-in chip uses `px-[9px] py-[8px]` (below 44px). |
| `DashboardLayout` / `AdminLayout` | `h-dvh` column; sidebar `fixed` below `lg`; `main` `overflow-x-auto p-4 sm:p-8` | Sidebar 288px on a 320px viewport covers the whole screen (OK as drawer). `main` overflow-x can hide page-level overflow. Nav row `py-1.5` is a small tap target. |
| `PortalTopBar` | Flex, fixed 64px height, gold bar | Search input 14px + 138px width. Hamburger `p-2` with 22px icon. Page title hidden below `sm`. |
| `Modal` | `fixed inset-0` centred, `max-w-2xl`, `max-h-[90vh]`, `p-4` | Not full-screen / bottom-sheet below `md`. Uses `vh` not `dvh`. No focus trap. Close control `p-2`. Title `text-2xl` + `px-6` can crowd 320px. |
| `AppDialogHost` | Same centred overlay, `max-w-lg`, `px-6 py-8` | Same modal issues. `whitespace-pre-wrap` is good. |
| `PortalDropdown` | Portaled `fixed` menu, default `w-52` | Can overflow the viewport; no mobile sheet. |
| `DocumentReaderPanel` | Sticky header; maximised `fixed inset-0 z-[110]` | Inline PDF on small screens (Phase 3 wants download card below `md`). Safe-area only when maximised. |
| `EmbeddedPdfViewer` | pdf.js canvas, `h-[65dvh]` / `sm:h-[55vh]` / `md:h-[70vh]` | Not an iframe (better than raw embed) but still heavy on mobile; horizontal pan when zoomed. |
| `EventImage` | `w-full h-full object-cover` in 16:9 box | No `width`/`height` attributes, no `srcset`/`sizes`, no Supabase transforms. |
| `EventPosterImage` | `max-h-[70vh] max-w-full` | Can exceed layout on small screens; uses `vh`. |
| `BackgroundBlobs` | Absolute `w-[90vw]` etc., negative `left`/`right` | Classic overflow source; currently clipped by `overflow-hidden` / body overflow. |
| `PageHeader` | `pt-40 pb-20`, huge type | Rarely used vs custom heroes; still not fluid. |
| `Button` / `GlassButton` | Variants use `bg-primary`, `bg-secondary`, `text-secondary`, `bg-base` | Those colour tokens were **never** in the CDN theme. Pre-existing no-ops. `GlowingButton` (gold/charcoal) is the one actually used. |
| `PasswordInput` | Relative wrapper, eye button `p-1` | Eye control is below 44×44. |
| `TurnstileField` | Widget | Can overflow narrow cards; verify at 320px in Phase 4. |

---

## Route-by-route inventory

Routes are HashRouter paths (`/#/...`). Ministry slugs are generated from `lib/ministries.ts`.

### Public

| Route | Page / layout | Current layout | Responsive failures |
| --- | --- | --- | --- |
| `/` | `Home` in `PublicLayout` | Full-viewport hero (`min-h-screen` + overlays); `container`; mixed grids (`md:grid-cols-2`, vision cards `min-[480px]` 2-col → `md` 3-col → `lg` 4-col); FAQ accordion; upcoming events `EventCard` grid | Hero `4.25rem` title + `pt-[224px]`. Vision cards `min-h-[70px]` → `122px` with `whitespace-nowrap` from 480px (clip at 320–479). `overflow-hidden` on the page wrapper. |
| `/about` | `About` | Same hero pattern; 2-col vision; belief/history/leadership sections | Same hero type. Leadership photos/cards need wrap check. |
| `/about/history` | `History` | Hero + stacked story cards (`p-8 md:p-10`) | Hero type. Cards OK if they stay 1-col. |
| `/about/vision` | `Vision` | Hero + vision copy/cards | Same hero. |
| `/about/beliefs` | `StatementOfFaith` | Hero; sticky mobile controls `top-[4.5rem]`; desktop aside `lg:w-[280px] xl:w-[300px]`; topic search | Sticky bar `-mx-4` can interact badly with container. Search input `text-sm`. Numbered pills `min-h-[40px]`. `overflow-x-hidden` on inner wrapper. |
| `/about/leadership/:slug` | `LeadershipBio` | Hero; hamburger **hidden** on this route | Bio pages have **no mobile nav** at all. Hero type. |
| `/events` | `Events` | Hero; featured `md:grid-cols-2`; lists `sm:grid-cols-2 lg:grid-cols-3` | Hero type. Cards are already 1-col on the smallest phones. |
| `/events/sermons` | `events/Sermons` + `YouTubeSermonCatalog` | Hero; catalog `md:grid-cols-2 lg:grid-cols-3`; YouTube **iframes** | Iframes are unreliable / overflow on iOS. Search `placeholder` without always pairing a visible label. |
| `/events/:id` | `EventDetail` | Loading skeleton `min-h-screen`; hero; `md:grid-cols-3` details; RSVP `md:grid-cols-2` | Hero type. Poster `max-h-[70vh]`. RSVP form placeholders. |
| `/sunday-service` | `SundayService` | Shared ministry-style hero + `md:grid-cols-2` content | Hero type. |
| `/young-adults` | `YoungAdults` | Same | Same. |
| `/teens-youth` | `TeensYouth` | Same | Same. |
| `/children` | `KidsProgram` | Same + extra `md:grid-cols-2` | Same. |
| `/ministries` | `MinistriesIndex` | Hero + `md:grid-cols-2 lg:grid-cols-3` | Hero type. Cards 1-col below `md` (good). |
| `/boys-brigade`, `/cap`, `/connect-groups`, `/counselling`, `/couples`, `/family`, `/girls-brigade`, `/men`, `/missions`, `/pastoral-care`, `/plus-65`, `/women`, `/worship` | `MinistryPage` | Same template as dedicated ministry pages | Same hero/grid issues, repeated ~13 times. |
| `/im-new` | `ImNew` | Hero + content; **Modal** | Hero type. Modal not a sheet on small screens. |
| `/giving` | `Giving` | Hero + methods; **Modal** for unavailable CC | Hero type. Modal. |
| `/need-prayer` | `NeedPrayer` | Hero + form | Hero type. Confirm form labels / 16px inputs in Phase 3. |
| `/contact` | `Contact` | Hero; 3-step form; step indicator with `whitespace-nowrap` labels at `text-[9px]` | Step labels will clip or overflow at 320px. Multi-step + keyboard: submit can sit under the iOS keyboard. `grid-cols-2` name fields on signup-like steps. |
| `/login` | `Login` | Centred card `max-w-md p-10` on `min-h-[80vh]` green canvas; `pt-32`; **MfaChallenge** | **Highest risk.** `p-10` (40px) on 320px leaves ~240px content. Sign-up `grid-cols-2` name row. Placeholders present **with** labels (OK). Password toggle small. Turnstile width. Error text `text-xs`. Card can be clipped under fixed header + keyboard. |
| `/login-error` | `LoginError` | `min-h-screen`, `BackgroundBlobs`, `text-5xl` | `bg-base` is undefined (no background). Blobs overflow. |
| `/auth/callback` | `OAuthCallback` | `min-h-screen bg-secondary` | `bg-secondary` undefined. |
| `/` (OAuth wrapper) | `OAuthCallbackWrapper` | Loading `bg-base` | Same missing token. |
| `/reset-password` | `ResetPassword` | Same card pattern as login `p-10` | Same keyboard / padding risks. |
| `/terms`, `/privacy` | `Terms`, `Privacy` | Long prose in `PublicLayout` | Mostly fine; long URLs need `break-words`. |

Legacy redirects (not pages): `/events/sunday-service` → `/sunday-service`, `/events/young-adults`, `/events/teens-youth`, `/events/kids-program` → `/children`.

Unguarded: `/pending-approval` (`PendingApproval`) — `min-h-screen`, blobs, `whitespace-nowrap` subtitle lines, `text-3xl sm:text-5xl`.

### Member dashboard (`DashboardLayout`)

| Route | Page | Layout | Failures |
| --- | --- | --- | --- |
| `/dashboard` | `DashboardHome` | Stat cards `md:grid-cols-2 lg:grid-cols-3` | Cards 1-col on phone (good). Shared `OverviewStatCard` `min-h-[148px]`. |
| `/dashboard/calendar` | `AnnualCalendarPage` | Year grid `grid-cols-1 sm:2 lg:3 xl:4`; month `grid-cols-7` | 7-column month grid at 320px ≈ 45px/cell — cramped, not overflowing if `gap-px` and tiny type (`text-[10px]`). Week view `md:grid-cols-7` stacks on small screens (good). |
| `/dashboard/prayer` | `PrayerWall` | Single-column card list; **Modal** compose/edit; falling hearts `100vh` | Modal. Heart animation uses `vh`. Icon actions. |
| `/dashboard/newsletter` | `Newsletter` | List + `DocumentReaderPanel` | PDF inline on mobile. |
| `/dashboard/devotional` | `Devotional` | Same | Same PDF issue. List `max-h-[min(20rem,45vh)]`. |
| `/dashboard/sermons` | `Sermons` + catalog | Grids + YouTube iframes | Iframes. |
| `/dashboard/team` | `Team` | Directory cards; avatar `w-[59px] h-[59px]` | Likely OK; long names need `min-w-0`. |
| `/dashboard/events` | `EventsPrivate` | `EventsCalendarGrid` `sm:2 lg:3` | Same as public cards. |
| `/dashboard/roster` | `Roster` | Cards + **iframe** `h-[50vh] min-h-[320px] md:h-[800px]` | **Raw iframe** (roster PDF/sheet). Unreliable on iOS; 800px height on tablet is huge. |
| `/dashboard/security` | `UserSecurity` | Forms + several **Modals** (password, TOTP QR, recovery) | QR + recovery codes can overflow. Modal not a sheet. Inputs `text-sm` risk. |
| `/dashboard/profile` | `MyProfile` | Definition-list fields | Mostly stacked (good). |
| `/dashboard/help` | `DashboardHelp` | `HelpContent` prose | Check tables/code in help copy. |

### Admin (`AdminLayout`)

| Route | Page | Layout | Failures |
| --- | --- | --- | --- |
| `/admin` | `AdminOverview` | Stats `md:2 xl:4`; cards forced `w-[calc(100%-190px)]`; pending-user list | **Hardcoded 190px inset** makes cards very narrow on phones (320−190 = 130px). Second grid `md:grid-cols-2`. |
| `/admin/calendar` | `AnnualCalendarPage` | Same as member | Same 7-col month grid. |
| `/admin/users` | `AdminUsers` | Filters; **HTML table** `min-w-full` in `overflow-x-auto`; `PortalDropdown` actions; **Modals** (create, link, intro email) | Table stays tabular on mobile (horizontal scroll only). No stacked-card alternative. Create-user modal `grid-cols-2`. Search `sm:w-80`. |
| `/admin/roles` | `AdminRoles` | **Table** `min-w-full`; **Modal** form | Same table issue. |
| `/admin/emails` | `AdminEmails` | Quota cards; **table** in `overflow-x-auto`; `whitespace-nowrap` dates | Horizontal scroll. |
| `/admin/logs` | `AdminLogs` | **Table `min-w-[900px]`** in `overflow-x-auto` | Guaranteed overflow on anything under 900px. No scroll affordance. Sticky first column absent. |
| `/admin/changelog` | `AdminChangelog` | Filter chips + cards/list (super-admin) | Filter row wrap; `p-10` empty state. |
| `/admin/prayer` | `AdminPrayerWall` | Cards + **Modal** | Same as member prayer. |
| `/admin/newsletter` | `AdminNewsletter` | `md:grid-cols-3` editor/list; **Modals**; PDF panel | 3-col at `md` is tight on 768px. PDF. Icon buttons have 44px (good). |
| `/admin/devotional` | `AdminDevotional` | Same as newsletter | Same. |
| `/admin/team` | `AdminTeam` | **Table** like users; **Modal** large form; `PortalDropdown`; `min-w-[180px]` name cell | Same table + wide form fields. |
| `/admin/events` | `AdminEvents` | Form + RSVP **table** in `overflow-x-auto` | RSVP table. Event form labels/placeholders. |
| `/admin/roster` | `AdminRoster` | Groups + **iframe** PDF preview `h-96` in **Modal** | Iframe preview on mobile. |
| `/admin/settings` | `AdminSettings` | Three **tables `min-w-[760px]`** with `-mx-4` scroll wrappers | Horizontal tables. Add-row `sm:min-w-[240px]`. |
| `/admin/security`, `/admin/profile`, `/admin/help` | shared pages | Same as dashboard | Same. |

### Present in the repo but **not routed**
- `pages/dashboard/Photos.tsx` — masonry `columns-1 sm:2 md:3 lg:4` gallery.
- `pages/admin/AdminPhotos.tsx` — folders + **Modals** + upload previews.

Do not wire these without asking (out of scope / possible unfinished feature).

---

## Hardcoded widths, min-widths, heights, `w-[…px]`, viewport units

### Arbitrary pixel widths / min-widths
| Location | Classes |
| --- | --- |
| `PortalTopBar` | `w-[72px]`, `h-[45px]`, `w-[138px]`, `sm:w-[181px]`, `md:w-[213px]` |
| `DashboardLayout` / `AdminLayout` | `w-72`, `lg:w-[72px]` |
| `AdminOverview` | `w-[calc(100%-190px)]` |
| `AdminLogs` | `min-w-[900px]`, `min-w-[240px]`, `max-w-[160px]` |
| `AdminSettings` | `min-w-[760px]`, `w-[160px]`, `sm:min-w-[240px]` |
| `AdminTeam` / `AdminUsers` | `min-w-[180px]`, `sm:w-80` |
| `LinkDirectoryUserModal` | `min-w-[200px]` |
| `StatementOfFaith` | `lg:w-[280px]`, `xl:w-[300px]` |
| `Team` (member) | `w-[59px] h-[59px]` |
| `PublicLayout` | `space-x-[42px]`, `px-[9px] py-[8px]`, `lg:px-[17px] lg:py-[12px]`, `xl:px-[25px]` |
| `Home` / `About` | `pt-[224px] md:pt-[256px]`, `h-[26px] w-[26px]`, `min-h-[70px]` / `90px` / `106px` / `122px` |
| `IntroInquiryEmailModal` | `min-h-[220px]` |
| `OverviewStatCard` | `min-h-[148px]`, `min-h-[32px]`, `min-h-[1.375rem]` |

Standard Tailwind widths also used as effectively fixed: `w-72` (288px sidebar), `w-56` (dropdowns), `w-52` (`PortalDropdown`), `max-w-md` / `max-w-2xl` / `max-w-lg`.

### Viewport units
| Location | Usage |
| --- | --- |
| `index.css` body (was index.html) | Falling-heart keyframes `50vh` / `100vh` |
| Most public heroes, loading shells | `min-h-screen` |
| `PublicLayout` mobile menu | `h-screen` |
| Portal layouts | `h-dvh` + `lg:h-screen` |
| `Login` / MFA / reset | `min-h-[80vh]` |
| `EmbeddedPdfViewer` | `h-[65dvh]`, `sm:h-[55vh]`, `md:h-[70vh]` |
| `EventPosterImage` | `max-h-[70vh]` |
| `Roster` iframe | `h-[50vh] min-h-[320px] md:h-[800px]` |
| Newsletter/devotional lists | `max-h-[min(20rem,45vh)]`, `md:max-h-[min(36rem,calc(100dvh-11rem))]` |
| `Modal` | `max-h-[90vh]` |
| `BackgroundBlobs` | `w-[90vw]` / `70vw` / `80vw` / … and matching `h-[…vw]` |

`100vw` as a class is not used; blobs use `90vw` etc. Body overflow currently clips them.

---

## Tables, modals, dropdowns, grids, sidebars, PDFs, galleries

### Tables (all stay wide on small screens)
- `AdminUsers`, `AdminTeam`, `AdminRoles`, `AdminEmails` — `min-w-full` + `overflow-x-auto`
- `AdminLogs` — `min-w-[900px]`
- `AdminSettings` — three `min-w-[760px]` tables
- `AdminEvents` — RSVP table

Email HTML tables in Edge Functions are **out of scope** (not the SPA).

### Modals / dialogs
- Shared: `Modal`, `AppDialogHost`
- `CreateUserProfile`, `LinkDirectoryUserModal`, `IntroInquiryEmailModal`
- Admin: users, roles, team, events, roster, newsletter, devotional, prayer, photos (unrouted)
- Public: `ImNew`, `Giving`
- Auth: `UserSecurity` (several), `MfaChallenge` (full page card, not Modal)

### Dropdowns
- Public header hover menus (`w-56`)
- Public footer accordion (`aria-expanded` present)
- `PortalTopBar` user menu + search + notify
- `PortalDropdown` on Users and Team action menus
- `StyledSelect`

### Multi-column grids (need 1 / 2 / 3+ audit in Phase 3)
- Public: events, ministries, vision cards, footer `lg:grid-cols-5`, sermon catalog
- Portal: overview stats, newsletter/devotional `md:grid-cols-3`, calendar months
- `CreateUserProfile` `grid-cols-2` (no breakpoint — two columns even at 320px)
- Login sign-up names `grid-cols-2` (same)

### Sidebars
- Public: none (header + full-screen overlay)
- Portal: `w-72` / `lg:w-[72px]`
- `StatementOfFaith`: desktop TOC `lg:w-[280px]`

### PDF / embeds
- `EmbeddedPdfViewer` + `DocumentReaderPanel` — newsletters, devotionals
- `Roster` member page — iframe
- `AdminRoster` — iframe preview in modal
- `YouTubeSermonCatalog` — YouTube iframes

### Image galleries
- Unrouted `Photos` masonry columns
- Unrouted `AdminPhotos`
- Event cards / posters from Supabase Storage (no `srcset`)

---

## Horizontal overflow candidates

1. Hero titles at `4.25rem` with non-breaking padded words.
2. `BackgroundBlobs` `90vw` + negative positioning.
3. Admin tables `min-w-[760px]` / `min-w-[900px]` (partially contained in `overflow-x-auto`).
4. `AdminOverview` `w-[calc(100%-190px)]` plus padding.
5. `whitespace-nowrap` on Contact step labels, PendingApproval subtitles, log cells, Home/About vision labels from 480px.
6. YouTube / roster iframes with default 300px+ intrinsic min-width.
7. Portal search + icons in a 64px gold bar at 320px (`138px` search + hamburger + bell + help).
8. Public desktop-style dropdowns if a tablet in landscape uses `lg`.
9. Turnstile widget inside `p-10` login card.
10. Long emails / URLs without `break-words` (users table, logs, help).
11. `VibrantCard` decorative `-right-10 w-40` blobs.
12. MFA code input `tracking-[0.4em] text-lg`.

`body { overflow-x: hidden }` currently **masks** several of these.

---

## Touch targets and forms (Phase 3 checklist)

**Below 44×44 (examples):** public hamburger `p-2`; portal menu `p-2`; password eye `p-1`; modal close `p-2`; StatementOfFaith TOC `min-h-[40px]`; GlowingButton `sm` `py-2 text-xs`; log-in chip `py-[8px]`; table checkboxes `h-4 w-4`; adjacent icon buttons in admin lists (some already `min-h-[44px]`).

**Forms:** Login/reset have labels above inputs (good) and 16px-ish padding. Admin search / changelog / logs use `text-sm`. Contact wizard step 1 likely needs `inputMode`/`autoComplete` pass. Sign-up name row is two columns at all widths.

---

## Accessibility / motion (Phase 4)

- `prefers-reduced-motion` is already honoured for `.animate-on-scroll` only — not for blob, hover-lift, falling hearts, or Tailwind `animate-*`.
- 200% zoom: fixed header + `pt-[224px]` heroes and portal `h-16` + sidebar will eat vertical space; login `p-10` card will be the first to fail.
- Public mobile menu: missing focus trap, `aria-expanded`, Escape, route-change close.

---

## Phase 0 notes (pipeline, not layout)

Done in this ticket before the audit:

- Tailwind **v3.4.19** + PostCSS + Autoprefixer (matches Play CDN, not Tailwind v4).
- This repo has **no `src/` folder**. CSS is `index.css` imported from `index.tsx`. Content globs cover `index.html`, `index.tsx`, `App.tsx`, `components/`, `pages/`, `context/`, `lib/`.
- Custom CDN colours/animations moved to `tailwind.config.js`. `amber` / `teal` / `neutral` keep a `DEFAULT` hex **and** the default shade palettes so both `text-neutral` and `bg-amber-50` compile.
- `npm run build` succeeded. Compiled CSS includes `bg-gold`, `w-[72px]`, `min-[480px]`, `h-[65dvh]`, `space-x-[42px]`, `pt-[224px]`, `w-[calc(100%-190px)]`, `glass-card`, `animate-blob`.

### Classes that looked CDN-only
All JIT / arbitrary syntax used in the app compiled:

- Arbitrary values: `w-[72px]`, `min-w-[900px]`, `pt-[224px]`, `space-x-[42px]`, `h-[65dvh]`, `max-h-[min(20rem,45vh)]`, `w-[calc(100%-190px)]`, `min-[480px]:…`
- Opacity modifiers: `bg-gold/10`, `bg-charcoal/20`
- Custom theme: `text-gold`, `bg-dash`, `text-charcoal`, `animate-blob`, `animate-fade-in-up`

### Tokens that never existed (CDN or build)
- `bg-primary`, `bg-secondary`, `text-secondary`, `bg-base` (`Button`, `GlassButton`, `LoginError`, `OAuthCallback*`)
- `font-raleway` (no font loaded)
- `.shine-text` (no CSS)

Phase 0 did not invent those colours. Flag if you want them defined in Phase 2.

---

## Recommended Phase 3 order (after you approve Phase 2)

1. Public layout: header, hamburger drawer (focus trap, `md` vs current `lg`), footer, safe areas.
2. Auth: login, signup, MFA, reset, login-error, pending-approval (320px + keyboard).
3. Shared `Modal` / `AppDialogHost` → sheet below `md`.
4. Home / About heroes and vision grids (shared pattern).
5. Remaining public marketing pages (clone-hero set).
6. Contact wizard + Giving / ImNew modals.
7. Portal chrome (`PortalTopBar` + sidebars).
8. Overview cards (`w-[calc(100%-190px)]`).
9. Admin tables → stacked cards or labelled scroll.
10. PDF panel + roster iframe + YouTube catalog.
11. Forms/inputs 16px + 44px targets sweep.

---

## Conflicts to confirm before Phase 2–3

1. Public nav today collapses at **`lg` (1024)**. Spec says below **`md` (768)**. Changing that would show the desktop nav on tablet portrait. **Please confirm.**
2. Leadership bio pages **hide** the hamburger. Should that stay?
3. `body { overflow-x: hidden }` — remove during Phase 2 after overflow fixes?
4. Define missing `primary` / `secondary` / `base`, or leave `Button`/`GlassButton` unused as-is?
5. Unrouted Photos pages: ignore unless you want them in the matrix.

**Stopped here.** No Phase 2 foundation work until you approve this audit.
