# ABC-FEAT-008 — Admin RSVP list: search + filtered export

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: BACKLOG

## Context
Admins can view RSVPs for an event, but there is no search/filter UI. Exports should match the directory behavior: export exactly what is currently filtered and displayed.

## Scope
### RSVP modal enhancements
- In `pages/admin/AdminEvents.tsx` RSVP modal:
  - Add search input to filter by name/email (case-insensitive substring match).
  - Show “Showing X of Y” where Y is total RSVPs for the event and X is filtered count.
  - Keep the existing table layout.

### Filtered export wiring
- Ensure CSV/PDF export uses the filtered list (not always full list).
  - Uses enhanced export formatting from `ABC-FEAT-005`.

## Acceptance criteria
- [ ] Admin RSVP modal has a search box that filters rows by name/email.
- [ ] Export CSV and PDF export **only the filtered rows currently shown**.
- [ ] Count display shows filtered vs total.
- [ ] No console errors introduced.

