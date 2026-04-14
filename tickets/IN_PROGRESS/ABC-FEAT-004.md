# ABC-FEAT-004 — Events: audience filter (Staff/Members/Attendees/All)

**Priority**: P2  
**Owner**: Developer Agent  
**Status**: IN_PROGRESS

## Context
Events should support an Audience setting: Staff / Members / Attendees / All.

Important rule: **Public events must always be visible to all** (public website + dashboards). Audience should primarily apply to non-public (internal) events unless otherwise specified.

Because the current `users` table does not store staff/member/attendee explicitly (only `role: admin|member`), we will implement the audience filter using the existing auth signal:
- **Staff** → admin users only
- **Members** → any logged-in user (admin or member)
- **Attendees** → public visitors (not logged in)
- **All** → everyone

## Scope
### Data
- Add `events.audience` with allowed values: `all | staff | members | attendees`.
- Default:
  - For `is_public = true`: audience behaves as `all` (public always visible)
  - For `is_public = false`: default `members` (keeps current behavior: all logged-in users can see internal events)

### UI
- Admin event form (`pages/admin/AdminEvents.tsx`):
  - Add an “Audience” dropdown with the 4 values.
  - Add helper text explaining the mapping above.

### Enforcement
- Public website:
  - Continue showing only `is_public = true` (no change), audience effectively irrelevant.
- Dashboard Events (logged-in):
  - Show all public events + internal events where `audience in (all, members)`; admins also see staff-only.
- Admin Events:
  - Admin sees all events (management view).

## Acceptance criteria
- [ ] Admin can set audience per event.
- [ ] Public events remain visible to everyone regardless of audience selection.
- [ ] Internal events respect audience mapping (staff-only visible only to admins).
- [ ] No console errors introduced.

