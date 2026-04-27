# ABC-FEAT-005 — RSVP export: match Directory PDF/CSV styling

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: IN_PROGRESS

## Context
Directory/People export already has the desired PDF header/footer style. Event RSVP exports should match the same look and include export metadata and pagination.

## Scope
### RSVP PDF
- Update `lib/exportEventRsvps.ts` PDF export to match Directory PDF styling:
  - Header (centered): `Church name – Directory/people List` equivalent for RSVP, using: `Ashburton Baptist Church – RSVPs — <Event Title>`
  - Footer:
    - Left: exported date/time (local)
    - Right: page number (e.g., `Page 1`)
- No logo in PDF.
- Styling to match directory export (font sizes, margins, gold header row).

### RSVP CSV
- Update `lib/exportEventRsvps.ts` CSV export to match Directory CSV formatting pattern:
  - Title line at top (church name + “RSVPs — <Event Title>”)
  - Blank line
  - Header row
  - Data rows
  - Blank line
  - Exported date/time line at bottom

## Acceptance criteria
- [ ] RSVP PDF has centered title header, footer exported date/time (left) and page number (right).
- [ ] RSVP CSV includes title line and exported date/time line (same structure as directory CSV).
- [ ] Exports reflect **exactly the currently filtered rows** (will be wired in `ABC-FEAT-008`).
- [ ] No logo is added to any export.
- [ ] No console errors introduced.

## Notes / implementation hints
- Directory exports live in `lib/exportDirectoryPeople.ts` and can be used as reference for layout.
- Church name source: `metadata.json` is currently used by `pages/admin/AdminTeam.tsx`.

