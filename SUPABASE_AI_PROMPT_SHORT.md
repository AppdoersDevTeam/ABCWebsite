# Quick Supabase AI Prompt (Short Version)

Copy this into Supabase AI:

---

Set up a church management database with:

**8 Tables:**
1. `users` - id (UUID, refs auth.users), email, phone, name, is_approved (default false), role ('member'|'admin', default 'member'), created_at
2. `prayer_requests` - id, user_id, name, content, is_anonymous, is_confidential, prayer_count (default 0), timestamps
3. `prayer_counts` - id, prayer_request_id (CASCADE delete), user_id, created_at, UNIQUE(prayer_request_id, user_id)
4. `events` - id, title, date, time, location, category, description, is_public (default true), timestamps
5. `newsletters` - id, title, month, year, pdf_url, timestamps
6. `roster` - id, name, role, date, status ('confirmed'|'pending'|'declined'), team ('Worship'|'Tech'|'Welcome'|'Kids'), image_url, timestamps
7. `photos` - id, folder_id (CASCADE delete), url, title, description, created_at
8. `photo_folders` - id, name, description, cover_image_url, created_at

**RLS Policies:**
- users: read own, update own, insert allowed
- prayer_requests: public read non-confidential, authenticated create, users update/delete own
- prayer_counts: authenticated read/create, users delete own
- events: public read public events, authenticated read all, admins manage all
- newsletters/roster/photos/photo_folders: authenticated read, admins manage all

Admin check: EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin' AND is_approved = true)

**Trigger:**
Function `handle_new_user()` on auth.users INSERT - creates user profile with is_approved=false, role='member'

**Storage Buckets (public):**
- newsletters (PDFs)
- photos (images)
- roster-images (images)

All buckets: public read, authenticated upload/update/delete own files.

Provide complete SQL.

---

