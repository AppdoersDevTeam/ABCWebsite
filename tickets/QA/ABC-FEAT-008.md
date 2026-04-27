# ABC-FEAT-008 — Admin RSVP list: search + filtered export

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: QA

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
- [x] Admin RSVP modal has a search box that filters rows by name/email.
- [x] Export CSV and PDF export **only the filtered rows currently shown**.
- [x] Count display shows filtered vs total.
- [x] No console errors introduced.

## QA checklist
- [ ] Open Admin → Events, click the RSVP icon on an event with multiple RSVPs.
- [ ] Verify search filters by both name substring and email substring (case-insensitive).
- [ ] Verify count reads “Showing X of Y” and updates as you type.
- [ ] Export CSV and confirm it only includes the filtered rows.
- [ ] Export PDF and confirm it only includes the filtered rows.

