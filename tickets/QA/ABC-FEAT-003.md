# ABC-FEAT-003 — Events: RSVP (optional) + admin RSVP list + export (CSV/PDF)

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: IN_PROGRESS

## Context
Each event should optionally support RSVPs. Admins need to see who RSVPed and download the list. RSVPs should be available for public users (not logged in).

## Scope
### Data
- Add `events.rsvp_enabled` (boolean) to control whether RSVP is available for the event.
- Create `event_rsvps` table:
  - `id` (uuid)
  - `event_id` (fk → events.id)
  - `name` (text)
  - `email` (text)
  - `created_at` (timestamp)
  - Unique constraint on (`event_id`, `email`) to prevent duplicate RSVPs per email.

### Event detail RSVP UX (public)
- On `/events/:id`:
  - If `rsvp_enabled = true`, show RSVP UI:
    - RSVP button → opens a small form (name + email)
    - Submit inserts into `event_rsvps`
    - Handle duplicate emails gracefully (show “You’ve already RSVPed”)
  - If `rsvp_enabled = false`, hide RSVP UI.

### Admin RSVP list + export
- In `pages/admin/AdminEvents.tsx`:
  - Add per-event “View RSVPs” action.
  - Show:
    - RSVP count
    - List: name, email, RSVP date/time
  - Add export:
    - Download CSV
    - Download PDF
  - Exports must include exactly the currently shown RSVP rows for that event.

## Acceptance criteria
- [ ] Admin can toggle RSVP enabled/disabled per event.
- [ ] Public users can RSVP for an event when enabled.
- [ ] Duplicate RSVP by same email for same event is prevented and communicated clearly.
- [ ] Admin can view RSVP list and see count.
- [ ] Admin can download RSVP list as **CSV and PDF**.
- [ ] No console errors introduced.
- [ ] Responsive: RSVP form + admin list usable on mobile.

## Notes / implementation hints
- Export pattern exists for directory people:
  - `pages/admin/AdminTeam.tsx` uses `downloadDirectoryCsv` and `downloadDirectoryPdf` (see `lib/exportDirectoryPeople`).
- RSVP is **optional** (enabled = on shows UI; no “required gate” behavior).

