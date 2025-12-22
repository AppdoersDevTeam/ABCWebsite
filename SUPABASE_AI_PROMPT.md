# Supabase AI Setup Prompt

Copy and paste this entire prompt into Supabase AI (Claude in the Supabase Dashboard) to set up your Church application database:

---

**PROMPT FOR SUPABASE AI:**

I need to set up a complete database schema for a church management application. Please create all the following:

## 1. Database Tables

Create these 8 tables with the specified columns and constraints:

### Table 1: users
- id (UUID, PRIMARY KEY, REFERENCES auth.users(id))
- email (TEXT, nullable)
- phone (TEXT, nullable)
- name (TEXT, NOT NULL)
- is_approved (BOOLEAN, DEFAULT false)
- role (TEXT, DEFAULT 'member', CHECK constraint: must be 'member' or 'admin')
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Table 2: prayer_requests
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- user_id (UUID, REFERENCES auth.users(id), nullable)
- name (TEXT, NOT NULL)
- content (TEXT, NOT NULL)
- is_anonymous (BOOLEAN, DEFAULT false)
- is_confidential (BOOLEAN, DEFAULT false)
- prayer_count (INTEGER, DEFAULT 0)
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- updated_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Table 3: prayer_counts
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- prayer_request_id (UUID, REFERENCES prayer_requests(id) ON DELETE CASCADE)
- user_id (UUID, REFERENCES auth.users(id))
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- UNIQUE constraint on (prayer_request_id, user_id)

### Table 4: events
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- title (TEXT, NOT NULL)
- date (DATE, NOT NULL)
- time (TEXT, NOT NULL)
- location (TEXT, NOT NULL)
- category (TEXT, DEFAULT 'Other')
- description (TEXT, nullable)
- is_public (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- updated_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Table 5: newsletters
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- title (TEXT, NOT NULL)
- month (TEXT, NOT NULL)
- year (INTEGER, NOT NULL)
- pdf_url (TEXT, NOT NULL)
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- updated_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Table 6: roster
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- name (TEXT, NOT NULL)
- role (TEXT, NOT NULL)
- date (DATE, NOT NULL)
- status (TEXT, DEFAULT 'pending', CHECK constraint: must be 'confirmed', 'pending', or 'declined')
- team (TEXT, NOT NULL, CHECK constraint: must be 'Worship', 'Tech', 'Welcome', or 'Kids')
- image_url (TEXT, nullable)
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- updated_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Table 7: photos
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- folder_id (UUID, REFERENCES photo_folders(id) ON DELETE CASCADE, nullable)
- url (TEXT, NOT NULL)
- title (TEXT, nullable)
- description (TEXT, nullable)
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Table 8: photo_folders
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- name (TEXT, NOT NULL)
- description (TEXT, nullable)
- cover_image_url (TEXT, nullable)
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

## 2. Row Level Security (RLS)

Enable RLS on all tables and create the following policies:

### users table policies:
1. "Users can read own data" - SELECT policy: users can only read their own record (WHERE auth.uid() = id)
2. "Admins can read all users" - SELECT policy: admins can read all users (check if current user is admin and approved)
3. "Users can update own data" - UPDATE policy: users can update their own record (WHERE auth.uid() = id)
4. "Admins can update user approvals" - UPDATE policy: admins can update any user's approval status (check if current user is admin and approved)
5. "Admins can delete users" - DELETE policy: admins can delete users (check if current user is admin and approved)
6. "Service role can insert users" - INSERT policy: allow inserts (WITH CHECK true)

### prayer_requests table policies:
1. "Public can read non-confidential requests" - SELECT policy: everyone can read where is_confidential = false
2. "Authenticated users can create requests" - INSERT policy: only authenticated users (WITH CHECK auth.role() = 'authenticated')
3. "Users can update own requests" - UPDATE policy: users can update their own requests (WHERE user_id = auth.uid())
4. "Users can delete own requests" - DELETE policy: users can delete their own requests (WHERE user_id = auth.uid())

### prayer_counts table policies:
1. "Authenticated users can read prayer counts" - SELECT policy: authenticated users only (WHERE auth.role() = 'authenticated')
2. "Authenticated users can create prayer counts" - INSERT policy: authenticated users only (WITH CHECK auth.role() = 'authenticated')
3. "Users can delete own prayer counts" - DELETE policy: users can delete their own counts (WHERE user_id = auth.uid())

### events table policies:
1. "Public can read public events" - SELECT policy: everyone can read where is_public = true
2. "Authenticated users can read all events" - SELECT policy: authenticated users can read all events (WHERE auth.role() = 'authenticated')
3. "Admins can manage events" - ALL operations policy: only approved admins can insert/update/delete (check if user exists in users table with role='admin' AND is_approved=true)

### newsletters table policies:
1. "Authenticated users can read newsletters" - SELECT policy: authenticated users only (WHERE auth.role() = 'authenticated')
2. "Admins can manage newsletters" - ALL operations policy: only approved admins (same check as events)

### roster table policies:
1. "Authenticated users can read roster" - SELECT policy: authenticated users only (WHERE auth.role() = 'authenticated')
2. "Admins can manage roster" - ALL operations policy: only approved admins (same check as events)

### photos table policies:
1. "Authenticated users can read photos" - SELECT policy: authenticated users only (WHERE auth.role() = 'authenticated')
2. "Admins can manage photos" - ALL operations policy: only approved admins (same check as events)

### photo_folders table policies:
1. "Authenticated users can read photo folders" - SELECT policy: authenticated users only (WHERE auth.role() = 'authenticated')
2. "Admins can manage photo folders" - ALL operations policy: only approved admins (same check as events)

## 3. Database Function and Trigger

Create a function and trigger to automatically create a user profile when a new user signs up:

Function: `handle_new_user()`
- Triggered AFTER INSERT on auth.users
- Check if email is 'devteam@appdoers.co.nz' (case-insensitive)
- Inserts a new record into public.users table with:
  - id = NEW.id
  - email = NEW.email
  - phone = NEW.phone
  - name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  - is_approved = true if email is 'devteam@appdoers.co.nz', otherwise false
  - role = 'admin' if email is 'devteam@appdoers.co.nz', otherwise 'member'
- Use SECURITY DEFINER

## 4. Storage Buckets

Create 3 public storage buckets:

1. **newsletters** - for PDF newsletter files
   - Set as public
   - Allow authenticated users to upload
   - Allow public to read

2. **photos** - for photo gallery images
   - Set as public
   - Allow authenticated users to upload
   - Allow public to read

3. **roster-images** - for roster assignment images
   - Set as public
   - Allow authenticated users to upload
   - Allow public to read

## 5. Storage Policies

For each bucket, create policies:
- SELECT: Allow public to read
- INSERT: Allow authenticated users to upload
- UPDATE: Allow authenticated users to update their own uploads
- DELETE: Allow authenticated users to delete their own uploads

## Important Notes:

- All new user signups should have `is_approved = false` by default
- **EXCEPTION:** The email 'devteam@appdoers.co.nz' is automatically set as admin and approved when they sign up
- Only 'devteam@appdoers.co.nz' can access the admin dashboard (enforced in application code)
- Other admin users must be manually approved and have `role = 'admin'` in the users table
- The admin check in policies should verify: user exists in users table, user.id = auth.uid(), user.role = 'admin', AND user.is_approved = true
- All timestamps should use TIMESTAMP WITH TIME ZONE
- Use CASCADE deletes where appropriate (prayer_counts, photos)

Please create all of this in the correct order (tables first, then RLS, then functions/triggers, then storage). Provide the complete SQL for everything.

---

**END OF PROMPT**

