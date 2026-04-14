# ABC-FEAT-001 — Admin Directory member table + export

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: QA

## Context
The admin “Directory / People” page needs an Excel-style table so admins can quickly see and manage all people (staff/member/attendee) and export filtered lists. In the regular user dashboard, the “Team” page should show **staff only** (no members or attendees).

## Scope
### Admin (Directory / People)
- Build an Excel-style table for `team_members` with columns:
  - Name, Email, Phone, Role, Status
- Add **filter by role/profile type** (multi-select checkboxes):
  - Staff / Member / Attendee
- Add **Download / Export** for the filtered list:
  - CSV export
  - PDF export
- Access control:
  - Only admins can access the admin dashboard (already enforced by route guard); page must remain admin-only.

### Regular user dashboard (Team)
- Show **staff only** with fields:
  - name, contact number (phone), email, photo, description, role type
- Members/attendees must **not** appear on this page.

## Acceptance criteria
- [x] Admin `/admin/team` shows a table view (not cards) with the 5 specified columns.
- [x] Profile type filter (Staff/Member/Attendee) is multi-select and updates the visible rows.
- [x] Export CSV downloads exactly the currently filtered rows with the 5 columns.
- [x] Export PDF downloads exactly the currently filtered rows with the 5 columns (table format).
- [x] Regular dashboard `/dashboard/team` shows only staff records and includes the specified fields.
- [x] No console errors introduced (verified dev server boots).
- [x] Responsive: table scrolls horizontally on small screens; filters and export remain usable.

## Notes / implementation hints
- Existing helpers: `inferProfileType` / `getDisplayRole` in `lib/teamMemberUtils.ts`.
- Admin page file: `pages/admin/AdminTeam.tsx`
- Dashboard team file: `pages/dashboard/Team.tsx`

