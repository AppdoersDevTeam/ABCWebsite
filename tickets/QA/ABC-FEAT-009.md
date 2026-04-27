# ABC-FEAT-009 — Roster per Ministry (Groups): data model + admin upload association

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: QA

## Context
Ministries and Groups are the same concept (existing `groups` table). Rosters should be uploaded per ministry/group and cover a date range (week/month/etc.), not just a single date.

## Scope
### Data changes
- Extend existing `roster_images` table to support ministry rosters:
  - Add `group_id` (fk → `groups.id`, required)
  - Replace/augment single `date` with date range:
    - `date_from` (date, required)
    - `date_to` (date, required)
  - Track upload date/time:
    - Use existing `created_at` if present, otherwise add `uploaded_at` (timestamp, default now)
- Storage remains `roster-images` bucket.

### Admin UI changes
- Update `pages/admin/AdminRoster.tsx` upload modal to include:
  - Ministry/Group selector (from `groups`, active ones)
  - Date From + Date To inputs
  - PDF file upload (existing)
- Roster list/cards should show:
  - Ministry name
  - Roster date range (From–To)
  - Report upload date (the upload timestamp)

## Acceptance criteria
- [x] Admin can upload a roster PDF and assign it to a ministry/group.
- [x] Admin must enter date range (From/To).
- [x] Admin roster list shows ministry name + date range + upload date.
- [x] No console errors introduced. (Build passes; no new lints.)

## QA notes
- **Build**: `npm run build` ✅
- **SQL**: `CREATE_ROSTER_IMAGES_TABLE.sql` is now idempotent (safe to re-run when `roster_images` already exists).
- **Manual smoke test (recommended)**:
  - Admin → Roster Management → Upload roster PDF:
    - Select ministry
    - Pick date range
    - Upload PDF
    - Confirm card shows ministry + date range + “Uploaded …”
  - Dashboard → Roster:
    - Confirm header shows ministry + date range and PDF renders

## Dev notes
- Updated SQL scripts:
  - `CREATE_ROSTER_IMAGES_TABLE.sql`: adds/ensures `group_id`, `date_from`, `date_to`, updates uniqueness + indexes, drops old `UNIQUE(date)` if present.
  - `MIGRATE_ROSTER_TO_PDF.sql`: adds the new columns + backfills `date_from/date_to` from legacy `date` when present.
- Updated UI:
  - `pages/admin/AdminRoster.tsx`: upload modal now requires ministry + date range; roster cards show ministry + range + upload timestamp.
  - `pages/dashboard/Roster.tsx`: displays ministry + date range (latest-first viewer).

## Leader rule (confirmed)
- A person is a leader of group G if:
  - They are in group G, AND
  - They have a job role named exactly: `"<Group Name> Leader"` (e.g. `Worship Leader`, `Kids Programme Leader`).

This supports a single person leading multiple groups by assigning multiple leader job roles.

