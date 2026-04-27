# ABC-FEAT-010 — Dashboard: show ministries list → ministry roster details

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: BACKLOG

## Context
Users should only see rosters for ministries (groups) they are part of. UX requested: user sees a list of their ministries and can click into each ministry to view rosters/details.

## Scope
### Access rules
- Determine the logged-in user’s ministry memberships:
  - Use existing team-member ↔ group relationship (current directory already uses `team_member_groups`).
- Only show rosters where `roster_images.group_id` is in the user’s groups.
- If user has no groups with rosters: show “No rosters at this time.”

### Dashboard UX
- Replace the current flat roster browser in `pages/dashboard/Roster.tsx` with:
  - A ministry list view (cards/list):
    - Ministry name
    - Leader name + photo (see leader rule below)
    - Latest roster date range (if any)
  - Clicking a ministry opens a ministry detail view (route or in-page):
    - Leader name + photo
    - List of rosters for that ministry (most recent first)
    - Clicking a roster shows the PDF (iframe or “open in new tab” link consistent with current behavior)

## Acceptance criteria
- [ ] User sees only rosters for ministries they belong to.
- [ ] User sees a list of their ministries and can click into each ministry to view rosters.
- [ ] Users not in any roster-linked ministry see “No rosters at this time.”
- [ ] No console errors introduced.

## Leader rule (confirmed)
- Leader is derived from directory:
  - Person must be in the ministry/group AND have a job role named exactly: `"<Group Name> Leader"`.
  - Photo comes from `team_members.img`.

