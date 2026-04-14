# ABC-FEAT-002 — Events: images + categories + calendar UI + detail page

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: IN_PROGRESS

## Context
We need to upgrade the Events module to support event images (with a default banner), richer category options, a calendar view that shows thumbnails and a “See More” CTA, and a proper event detail page.

Public events (`events.is_public = true`) must be visible:
- On the public-facing Events page
- In the user dashboard Events page
- In the admin Events page

Private events (`events.is_public = false`) must remain hidden from the public website, but visible to logged-in users and admins (current behavior).

## Scope
### Data
- Add `events.image_url` (text, nullable).
- Ensure when no image is uploaded, UI falls back to the site logo banner: **`/ABC Logo.png`**.

### Admin — Events creation/edit
- Add **event image upload** field to `pages/admin/AdminEvents.tsx` create/edit modal.
- Upload image to Supabase Storage (new bucket recommended: `events`).
- Save resulting URL into `events.image_url`.
- If no image uploaded: store `image_url` as empty/null; frontend must still auto-display the default banner.

### Categories
- Update admin category options to the church’s real category list (stored in `events.category`).
  - Initial list: Sunday Service, Members Meeting, Fast & Prayer Meeting, Young Adults, Kids Programme, Community Lunch, Other

### Public calendar view
Update `pages/public/Events.tsx` “Upcoming Events” list/cards to show:
- Thumbnail (event image or default banner)
- Date
- Title
- A **“See More”** button

Clicking “See More” must go to the event detail page.

### Event detail page
- Add a new route + page for event details: `/events/:id`
- Detail page must show:
  - Full photo/banner (event image or default banner)
  - Date, time, location, title, category, description
  - (RSVP button area will be implemented in `ABC-FEAT-003`)

## Acceptance criteria
- [ ] Admin can upload an event image when creating/editing an event; image is persisted and displays across views.
- [ ] If event has no image, the UI displays **`/ABC Logo.png`** as the default banner.
- [ ] Public “Upcoming Events” cards show thumbnail + date + title + “See More”.
- [ ] “See More” navigates to `/events/:id` and renders full event details.
- [ ] Public events show on public website and in dashboards; private events remain dashboard-only.
- [ ] No console errors introduced.
- [ ] Responsive: cards and detail page look good on mobile/tablet/desktop.

## Notes / implementation hints
- Current pages:
  - Public events: `pages/public/Events.tsx` (filters `.eq('is_public', true)`)
  - Dashboard events: `pages/dashboard/EventsPrivate.tsx` (currently selects all)
  - Admin events: `pages/admin/AdminEvents.tsx`
- Site logo (default banner): `src="/ABC Logo.png"` used in `components/Layouts/PublicLayout.tsx`, `DashboardLayout.tsx`, `AdminLayout.tsx`.

