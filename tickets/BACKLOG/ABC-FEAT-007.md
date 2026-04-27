# ABC-FEAT-007 — Event categories: manage like Groups/Job Roles (Admin Settings tab)

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: BACKLOG

## Context
Event categories are currently hardcoded in `pages/admin/AdminEvents.tsx`. They should be managed from Admin Settings, similar to Groups and Job Roles, and categories should be addable/editable/deletable.

## Scope
### Data
- Add new Supabase table: `event_categories`
  - `id` (uuid, pk)
  - `name` (text, unique)
  - `slug` (text, unique)
  - `sort_order` (int, nullable)
  - `is_active` (boolean, default true)
  - `created_at` (timestamp)
- Seed initial categories with the current list:
  - Sunday Service
  - Members Meeting
  - Fast & Prayer Meeting
  - Young Adults
  - Kids Programme
  - Community Lunch
  - Other

### Admin UI
- In `pages/admin/AdminSettings.tsx`, add a new tab: **Event Categories**
- UI behavior should match Groups/Job Roles:
  - Add new category
  - Edit name
  - Toggle active
  - Save category
  - Delete category (with confirm)
  - Warn on unsaved changes when switching tabs/leaving page

### Events form integration
- Update `pages/admin/AdminEvents.tsx` Category dropdown to load from `event_categories` (active ones).
- Existing events with categories should continue to display; if a category is deleted/disabled, event editing should still behave sensibly (see below).

## Acceptance criteria
- [ ] Admin Settings has tabs: Groups, Job Roles, Event Categories.
- [ ] Admin can create, edit, disable, and delete categories.
- [ ] Admin Events category dropdown uses DB-backed categories (no hardcoded list).
- [ ] Existing categories are seeded into `event_categories`.
- [ ] No console errors introduced.

## Decision notes / edge cases
- If a category is **disabled**: it should not appear in dropdown for new events, but existing events with that category should still render that text.
- If a category is **deleted** and existing events reference it (as plain text today): events should still show stored category string; editing may show “(missing)” or keep string as-is (define in implementation).

