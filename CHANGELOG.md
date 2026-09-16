# Changelog

Human-readable development history for **Ashburton Baptist Church**.

The machine-readable source of truth is `CHANGELOG.json`. Newest entries appear first.
Never delete historical entries. Never rewrite historical entries unless explicitly correcting them.

Timezone for new entries: **Pacific/Auckland**. Authoritative version: `package.json`.

## CHG-2026-0916-001 — Development governance, changelog, and CI validation

**Date:** 2026-09-16
**Time:** 22:30:04
**Timezone:** Pacific/Auckland
**Version:** 1.0.0
**Type:** Infrastructure

**Request**

> Make a final architectural decision and implement production-grade development governance: changelog, Change IDs, semantic versioning, migration validation, testing, GitHub Actions, and a mandatory agent workflow.

**Changes**

* Added AGENTS.md as the authoritative AI development-governance document.
* Created CHANGELOG.json as the canonical machine-readable history and CHANGELOG.md as the generated human-readable form.
* Migrated all 60 existing Super Admin product-changelog entries from lib/changelog.ts, preserving original IDs, titles, summaries, details, authors, areas, and timestamps.
* Added Change ID generation (CHG-YYYY-MMDD-NNN) and validation that changelog Markdown and JSON stay synchronized.
* Set package.json to 1.0.0 as the first official SemVer and the single version source.
* Added Node validation scripts for changelog, version, migrations, and requiring a changelog update when application files change.
* Added a GitHub Actions CI workflow that runs validation, governance tests, and the production build.
* Pointed the Super Admin changelog UI at CHANGELOG.json instead of a second curated list.
* Documented supabase/migrations/ for new SQL; left historical root SQL files in place.
* Stopped tracking .env and added .env.example so secrets are not committed going forward.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Governance tests (node --test) and vite build were executed. Project-wide tsc already fails on pre-existing application errors unrelated to this change. No ESLint config exists. No application integration or e2e suite exists.

## 2026-09-16-changelog-date-filters — Changelog year, month, and date range filters

**Date:** 2026-09-16
**Time:** 19:20:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Super Admins can narrow the Changelog by calendar year, month, and/or a from–to date range. Exports include only the filtered rows.

**Changes**

* Super Admins can narrow the Changelog by calendar year, month, and/or a from–to date range. Exports include only the filtered rows.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-16-changelog-contrast — Changelog text contrast on light background

**Date:** 2026-09-16
**Time:** 19:08:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Changelog titles, summaries, and meta text use explicit dark colours so they stay readable on the white admin surface.

**Changes**

* Changelog titles, summaries, and meta text use explicit dark colours so they stay readable on the white admin surface.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-16-changelog-layout — Clearer Changelog timeline layout

**Date:** 2026-09-16
**Time:** 18:58:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Changelog entries use a vertical timeline with a clear title, typed badges, and a tidy footer for when, who, and area.

**Changes**

* Month headers show how many updates are in that period.
* Type badges include icons so colour is not the only cue.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-16-changelog-export — Export Changelog to Excel and PDF

**Date:** 2026-09-16
**Time:** 18:53:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Super Admins can download the changelog as Excel (CSV) or PDF. Exports include only the rows matching the current type, area, and search filters.

**Changes**

* Export buttons sit in the Changelog page header, next to the title.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-16-changelog-datetime-user — Changelog shows date, time, and who made each change

**Date:** 2026-09-16
**Time:** 18:49:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Every changelog row now includes the exact day and time the change shipped and the person or team who made it.

**Changes**

* Times display in your admin timezone (same as System Logs).
* Search includes the user name as well as title and summary.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-16-superadmin-changelog — Super Admin Changelog tab in the admin dashboard

**Date:** 2026-09-16
**Time:** 18:30:16
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> A Changelog tab sits next to Logs in the admin left menu. Only Super Admins can see or open it.

**Changes**

* Regular admins do not see the tab and are redirected to Overview if they guess the URL.
* Filter by type, area, or search. Entries are grouped by month.
* This is the product history — live activity still lives under Logs.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-15-hold-access — Hold Access for existing accounts

**Date:** 2026-09-15
**Time:** 02:35:23
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins can place website access on hold for security, separate from first-time pending approval.

**Changes**

* Held users see a distinct pending-access screen instead of the member portal.
* An email notifies the person when access is held.
* User Management includes a Held filter, export status, and restore flow.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-15-admin-role-emails — Emails when admin access is granted or removed

**Date:** 2026-09-15
**Time:** 02:13:50
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Promoting or demoting an admin now sends a confirmation email to that person.

**Changes**

* Promoting or demoting an admin now sends a confirmation email to that person.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-15-delete-user — Delete a user from User Management

**Date:** 2026-09-14
**Time:** 23:55:07
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins can remove an account after confirmation. The person receives an email confirming deletion.

**Changes**

* You cannot delete your own account while signed in.
* Super Admin and the Appdoers service account cannot be deleted.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-15-user-export — Export User Management lists to CSV and PDF

**Date:** 2026-09-15
**Time:** 02:48:09
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Download the currently visible user list with role, status, leadership link, and join date.

**Changes**

* Download the currently visible user list with role, status, leadership link, and join date.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-14-annual-calendar — Annual Calendar in admin and member portals

**Date:** 2026-09-14
**Time:** 23:10:29
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> A year / month / week calendar shows events, sermons, devotionals, and newsletters together.

**Changes**

* Coloured markers distinguish item types. Open a day, then tap an item to view it.
* The calendar updates when events, devotionals, or newsletters change.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-14-newsletters-week-date — Newsletters match devotionals: title, week date, latest-first archive

**Date:** 2026-09-14
**Time:** 19:05:44
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Admin newsletter publishing now uses a title and week date, with newest issues listed first.

**Changes**

* Admin newsletter publishing now uses a title and week date, with newest issues listed first.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-14-dashboard-nav-icons — Sidebar labels and icons for Prayers and Newsletters

**Date:** 2026-09-14
**Time:** 22:28:05
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Prayers uses a praying-hands icon; Newsletters has a distinct newspaper icon and colour.

**Changes**

* Prayers uses a praying-hands icon; Newsletters has a distinct newspaper icon and colour.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-14-page-headers — Shared page headers across admin and member sections

**Date:** 2026-09-15
**Time:** 03:14:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Left-menu pages use a consistent title, subtitle, and icon header.

**Changes**

* Left-menu pages use a consistent title, subtitle, and icon header.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-14-pending-oauth — Pending approval, OAuth, and HashRouter reliability

**Date:** 2026-09-15
**Time:** 00:53:03
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Sign-in callbacks, password recovery, and the pending-approval screen no longer drop people on a blank or looping page.

**Changes**

* Sign-in callbacks, password recovery, and the pending-approval screen no longer drop people on a blank or looping page.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-09-14-directory-linking — Leadership linking from User Management

**Date:** 2026-09-15
**Time:** 03:09:05
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Link a login to a Leadership person so ministry memberships and rosters apply. Recheck matches or pick a person by hand.

**Changes**

* Link a login to a Leadership person so ministry memberships and rosters apply. Recheck matches or pick a person by hand.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-08-28-watch-sermons-dashboard — Watch Sermons page in the member dashboard

**Date:** 2026-08-28
**Time:** 10:15:25
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Members can watch the church YouTube sermons from inside the member portal.

**Changes**

* Members can watch the church YouTube sermons from inside the member portal.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-08-28-overview-typography — Overview card typography

**Date:** 2026-08-28
**Time:** 10:19:04
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Overview titles and labels are easier to read; all-caps labels are no longer forced.

**Changes**

* Overview titles and labels are easier to read; all-caps labels are no longer forced.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-08-27-devotional-of-the-week — Devotional of the Week with in-page PDF reader

**Date:** 2026-08-27
**Time:** 15:53:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins upload a weekly PDF with title, subtitle, and week date. Members read it in the portal viewer — no download or new-tab link.

**Changes**

* Admins can edit an existing issue or replace the PDF.
* Upload drafts persist if you leave the form and come back.
* Archives are scrollable and listed newest first.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-08-27-pdf-viewer-fixes — PDF viewer blank screens, flicker, and mobile layout

**Date:** 2026-08-27
**Time:** 16:39:13
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Leaving a PDF, switching tabs, or reading on a phone no longer whites out the page or flashes the document.

**Changes**

* Leaving a PDF, switching tabs, or reading on a phone no longer whites out the page or flashes the document.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-08-27-turnstile — Cloudflare Turnstile on sign-in and admin email actions

**Date:** 2026-08-23
**Time:** 14:11:14
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> CAPTCHA protects login, signup, password reset, and related admin email flows from automated abuse.

**Changes**

* CAPTCHA protects login, signup, password reset, and related admin email flows from automated abuse.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-08-27-user-actions-menu — User Management actions collapsed into a dropdown

**Date:** 2026-08-27
**Time:** 15:23:49
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Pending user rows fit on smaller screens; actions sit in a single menu per person.

**Changes**

* Pending user rows fit on smaller screens; actions sit in a single menu per person.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-08-27-approval-email-errors — Clear errors when approval emails fail

**Date:** 2026-08-27
**Time:** 15:29:16
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> If an approval or review email cannot send, the admin sees the failure instead of a silent miss.

**Changes**

* If an approval or review email cannot send, the admin sees the failure instead of a silent miss.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-08-27-multiday-events — Clearer multi-day event schedules

**Date:** 2026-08-27
**Time:** 16:23:22
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Event pages show start and end dates and times without unreadable contrast.

**Changes**

* Event pages show start and end dates and times without unreadable contrast.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-26-remove-community-lunch — Community Lunch removed from event categories

**Date:** 2026-06-26
**Time:** 10:35:46
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Community Lunch is no longer listed as an event category across the site.

**Changes**

* Community Lunch is no longer listed as an event category across the site.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-23-verse-of-the-day — Verse of the day on the member dashboard

**Date:** 2026-06-23
**Time:** 20:23:38
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> The member Overview rotates a daily verse drawn from the ACTS Prayers set.

**Changes**

* The member Overview rotates a daily verse drawn from the ACTS Prayers set.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-23-audit-logs — System Logs audit trail

**Date:** 2026-06-23
**Time:** 20:08:23
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins can review sign-ins, sign-ups, admin changes, member activity, and RSVPs, then filter and export to CSV.

**Changes**

* Database triggers record many table changes automatically.
* Logs cannot be edited or deleted in the portal.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-23-event-images — Event posters display at the right size without stretching

**Date:** 2026-06-23
**Time:** 19:49:21
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Calendar cards, detail pages, and uploads use a 16:9 poster. Any photo format is accepted; the Watch Online button links correctly.

**Changes**

* Calendar cards, detail pages, and uploads use a 16:9 poster. Any photo format is accepted; the Watch Online button links correctly.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-22-production-seo — Production domain, SEO, and leadership pages

**Date:** 2026-06-22
**Time:** 19:45:28
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> The live site uses ashburtonbaptist.co.nz with search metadata. Placeholder leadership pages were removed.

**Changes**

* The live site uses ashburtonbaptist.co.nz with search metadata. Placeholder leadership pages were removed.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-21-mobile-dashboards — Admin and member dashboards work on phones

**Date:** 2026-06-21
**Time:** 19:24:16
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Mobile layouts scroll and stack correctly without changing the desktop layout.

**Changes**

* Mobile layouts scroll and stack correctly without changing the desktop layout.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-21-password-reset-hashrouter — Password reset works with HashRouter and recovery tokens

**Date:** 2026-06-21
**Time:** 18:43:59
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Reset links from email complete on the HashRouter site. Mobile no longer hangs on an infinite loading state.

**Changes**

* Reset links from email complete on the HashRouter site. Mobile no longer hangs on an infinite loading state.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-21-shared-event-calendar — Shared event calendar grid for admin and members

**Date:** 2026-06-21
**Time:** 18:24:06
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Admin and member event calendars use the same grid, cards, and category filters.

**Changes**

* Admin and member event calendars use the same grid, cards, and category filters.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-21-statement-of-faith — Statement of Faith page

**Date:** 2026-06-21
**Time:** 16:46:36
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> The public beliefs page publishes the adopted church document, with a congregation photo hero and a mobile article picker.

**Changes**

* The public beliefs page publishes the adopted church document, with a congregation photo hero and a mobile article picker.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-18-contact-form — Contact form connect-card fields and direct pastor email

**Date:** 2026-06-18
**Time:** 16:50:55
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> The contact form is a multi-step connect card (first/last name, optional phone, spouse, extra details) and emails the pastor directly.

**Changes**

* NZ mobile, landline, and toll-free numbers are accepted.
* Need Prayer was simplified; the Contact navbar dropdown was removed.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-18-signup-email — Email-only signup with confirmation

**Date:** 2026-06-18
**Time:** 18:05:17
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> People sign up with email, receive a branded confirmation message, and can complete signup even if they try again.

**Changes**

* People sign up with email, receive a branded confirmation message, and can complete signup even if they try again.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-18-giving — Giving page bank details and coming-soon online giving

**Date:** 2026-06-18
**Time:** 18:26:31
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> The Giving page shows the correct bank account. Give Securely opens a coming-soon message until online giving is ready.

**Changes**

* The Giving page shows the correct bank account. Give Securely opens a coming-soon message until online giving is ready.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-18-teens-youth — Teens & Youth events page

**Date:** 2026-06-18
**Time:** 12:43:17
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> A Tuesday 7pm Teens & Youth category and public page were added to Events.

**Changes**

* A Tuesday 7pm Teens & Youth category and public page were added to Events.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-18-sermons-search — Sermons playlist filter and title search

**Date:** 2026-06-18
**Time:** 12:09:39
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Watch Sermons can filter by playlist and search titles. Search no longer matches the description, and the dropdown stacks cleanly on mobile.

**Changes**

* Watch Sermons can filter by playlist and search titles. Search no longer matches the description, and the dropdown stacks cleanly on mobile.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-18-kids-programme — Kids Programme time set to 10am

**Date:** 2026-06-18
**Time:** 16:42:11
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Kids Programme copy uses 10am, and event contact buttons consistently say Get in touch.

**Changes**

* Kids Programme copy uses 10am, and event contact buttons consistently say Get in touch.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-18-hide-service-account — Appdoers service account hidden from other admins

**Date:** 2026-06-18
**Time:** 18:45:56
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> The Super Admin service account no longer appears in other admins’ user lists.

**Changes**

* The Super Admin service account no longer appears in other admins’ user lists.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-18-history-mobile — History page content visible on mobile

**Date:** 2026-06-18
**Time:** 12:12:41
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> The History timeline no longer renders blank on phones; hover is scoped to cards.

**Changes**

* The History timeline no longer renders blank on phones; hover is scoped to cards.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-06-18-im-new-maps — I’m New location link and visitor PDF coming soon

**Date:** 2026-06-18
**Time:** 16:42:21
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Church location uses a direct Google Maps place link. The new-visitor PDF download shows coming soon when the file is not available.

**Changes**

* Church location uses a direct Google Maps place link. The new-visitor PDF download shows coming soon when the file is not available.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-27-roster-ministries — Rosters per ministry with date ranges

**Date:** 2026-04-27
**Time:** 14:29:22
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins upload a roster PDF for a ministry (group) covering a from–to date range. Members only see rosters for ministries they belong to.

**Changes**

* Dashboard Roster shows a ministry list, then roster details and PDF preview.
* Published rosters can be edited (ministry, dates, or replacement file).
* Leader name and photo come from the matching “<Group> Leader” job role.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-27-event-categories-settings — Event categories managed in System Setup

**Date:** 2026-04-27
**Time:** 13:58:59
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins add, edit, disable, or delete event categories the same way as Groups and Job Roles. Event forms load the live list.

**Changes**

* Admins add, edit, disable, or delete event categories the same way as Groups and Job Roles. Event forms load the live list.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-27-password-reset — Forgot password and admin-sent password reset

**Date:** 2026-04-27
**Time:** 13:52:21
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Login has Forgot password? Admins can send a reset link from User Management. People set a new password on the recovery page.

**Changes**

* Login has Forgot password? Admins can send a reset link from User Management. People set a new password on the recovery page.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-27-rsvp-search-export — RSVP search and directory-styled CSV/PDF export

**Date:** 2026-04-27
**Time:** 13:51:31
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Admins can search RSVPs by name or email and export only the filtered rows, styled like the Leadership directory export.

**Changes**

* Admins can search RSVPs by name or email and export only the filtered rows, styled like the Leadership directory export.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-27-directory-groups-roles — Leadership groups, job roles, filters, and export

**Date:** 2026-04-27
**Time:** 12:14:58
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> System Setup stores Groups and Job Roles. The Leadership table filters by staff/member/attendee and exports CSV or PDF.

**Changes**

* Member dashboard Leadership shows staff only.
* Linking a login to a Leadership person is opt-in and re-checkable.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-27-help-pages — Help pages for admin and member portals

**Date:** 2026-04-27
**Time:** 16:47:25
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Each left-menu area has a short explanation of what it is for and typical tasks.

**Changes**

* Each left-menu area has a short explanation of what it is for and typical tasks.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-27-remove-photos — Photos section removed from admin

**Date:** 2026-04-27
**Time:** 17:07:28
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> The Photos tile and routes were taken out of the admin portal.

**Changes**

* The Photos tile and routes were taken out of the admin portal.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-27-prayer-button — I’m praying button refreshes the count

**Date:** 2026-04-27
**Time:** 14:30:40
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Tapping I’m praying on the prayer wall updates the count without a stale refresh.

**Changes**

* Tapping I’m praying on the prayer wall updates the count without a stale refresh.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-16-super-admin-roles — Super Admin role and first/last name

**Date:** 2026-04-16
**Time:** 20:49:20
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> The Super Admin account is protected. Any approved admin can promote or demote other admins. Profiles store first and last name.

**Changes**

* View as Member moved from the login page into the dashboard sidebars.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-16-events-module — Events: images, detail pages, RSVP, and audience

**Date:** 2026-04-14
**Time:** 20:39:38
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins upload event images, set audience (staff / members / attendees / all), and optionally collect RSVPs. Public events have a See More detail page.

**Changes**

* Missing images fall back to the church logo banner.
* Public events stay visible to everyone; private events stay in the dashboards.
* Calendar cards, RSVP flow, and admin event list were polished for production.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-14-directory-table — Admin Leadership directory table

**Date:** 2026-04-14
**Time:** 19:35:56
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Leadership is an Excel-style table with richer people profiles and export, instead of cards only.

**Changes**

* Leadership is an Excel-style table with richer people profiles and export, instead of cards only.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-04-14-oauth-callback — OAuth callback no longer 404s on refresh

**Date:** 2026-04-14
**Time:** 20:06:43
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Google sign-in return URLs survive a page refresh on the HashRouter app.

**Changes**

* Google sign-in return URLs survive a page refresh on the HashRouter app.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-02-01-sermons-youtube — Public Watch Sermons with YouTube embeds

**Date:** 2026-04-13
**Time:** 08:03:07
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> The public Sermons page embeds the church YouTube channel so visitors can watch messages.

**Changes**

* The public Sermons page embeds the church YouTube channel so visitors can watch messages.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-02-01-visual-refresh — Public pages match the home visual language

**Date:** 2026-02-01
**Time:** 19:54:54
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> FAQ accordions animate smoothly; scroll icons align on laptop and mobile.

**Changes**

* FAQ accordions animate smoothly; scroll icons align on laptop and mobile.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-01-24-admin-responsive — Admin layout works on smaller screens

**Date:** 2026-01-24
**Time:** 19:28:11
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> The admin sidebar collapses to a menu on phones.

**Changes**

* The admin sidebar collapses to a menu on phones.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2026-01-02-leadership-uploads — Leadership photo upload and descriptions

**Date:** 2026-01-02
**Time:** 20:35:52
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins upload a photo file instead of pasting a URL, and can add a description used on public leadership pages.

**Changes**

* Admins upload a photo file instead of pasting a URL, and can add a description used on public leadership pages.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2025-12-22-core-portals — Admin and member dashboards, prayer wall, and user management

**Date:** 2025-12-21
**Time:** 19:11:01
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Signed-in people land in a dashboard. Admins get Overview, User Management, and tools to run the site.

**Changes**

* Prayer wall for submitting and supporting requests.
* Roster PDFs, team members, dates and timezones, and skeleton loading states.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## 2025-12-21-public-site — Public church website and History page

**Date:** 2025-12-21
**Time:** 18:12:45
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> The public site launched with Home, About, Events, I’m New, Giving, Need Prayer, Contact, and History, plus the first admin dashboard.

**Changes**

* The public site launched with Home, About, Events, I’m New, Giving, Need Prayer, Contact, and History, plus the first admin dashboard.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.
