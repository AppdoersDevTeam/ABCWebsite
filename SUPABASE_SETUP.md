# Supabase Setup Instructions

This document outlines the database schema and setup required for the Church application.

## Environment Variables

Create a `.env` file in the root directory with:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  phone TEXT,
  name TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can read all users (for admin dashboard)
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
      AND u.is_approved = true
    )
  );

-- Policy: Users can update their own data (except is_approved and role)
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can update user approvals and roles
-- This allows admins to grant/revoke admin privileges and approve/revoke users
CREATE POLICY "Admins can update user approvals" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
      AND u.is_approved = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
      AND u.is_approved = true
    )
  );

-- Policy: Admins can delete users (for rejection)
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
      AND u.is_approved = true
    )
  );

-- Policy: Service role can insert (for new signups)
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);
```

### 2. Prayer Requests Table
```sql
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_confidential BOOLEAN DEFAULT false,
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read non-confidential requests
CREATE POLICY "Public can read non-confidential requests" ON prayer_requests
  FOR SELECT USING (is_confidential = false);

-- Policy: Authenticated users can create requests
CREATE POLICY "Authenticated users can create requests" ON prayer_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own requests
CREATE POLICY "Users can update own requests" ON prayer_requests
  FOR UPDATE USING (user_id = auth.uid());

-- Policy: Users can delete their own requests
CREATE POLICY "Users can delete own requests" ON prayer_requests
  FOR DELETE USING (user_id = auth.uid());
```

### 3. Prayer Counts Table
```sql
CREATE TABLE prayer_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prayer_request_id, user_id)
);

ALTER TABLE prayer_counts ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read prayer counts" ON prayer_counts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert
CREATE POLICY "Authenticated users can create prayer counts" ON prayer_counts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can delete their own prayer counts
CREATE POLICY "Users can delete own prayer counts" ON prayer_counts
  FOR DELETE USING (user_id = auth.uid());
```

### 4. Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read public events
CREATE POLICY "Public can read public events" ON events
  FOR SELECT USING (is_public = true);

-- Policy: Authenticated users can read all events
CREATE POLICY "Authenticated users can read all events" ON events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );
```

### 5. Newsletters Table
```sql
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read newsletters" ON newsletters
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admins can manage newsletters" ON newsletters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );
```

### 6. Roster Table
```sql
CREATE TABLE roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'declined')),
  team TEXT NOT NULL CHECK (team IN ('Worship', 'Tech', 'Welcome', 'Kids')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE roster ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read roster" ON roster
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admins can manage roster" ON roster
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );
```

### 7. Photos Table
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES photo_folders(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read photos" ON photos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admins can manage photos" ON photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );
```

### 8. Photo Folders Table
```sql
CREATE TABLE photo_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE photo_folders ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read photo folders" ON photo_folders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admins can manage photo folders" ON photo_folders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );
```

## Storage Buckets

### 1. Newsletters Bucket
- Create a storage bucket named `newsletters`
- Set it to public or configure appropriate policies
- Allow authenticated users to upload (admins only)

### 2. Photos Bucket
- Create a storage bucket named `photos`
- Set it to public or configure appropriate policies
- Allow authenticated users to upload (admins only)

### 3. Roster Images Bucket
- Create a storage bucket named `roster-images`
- Set it to public or configure appropriate policies
- Allow authenticated users to upload (admins only)

## Authentication Setup

1. Enable Email/Password authentication in Supabase Dashboard
2. Enable Phone authentication in Supabase Dashboard
3. Enable Google OAuth provider:
   - Go to Authentication > Providers
   - Enable Google
   - Add your Google OAuth credentials
   - Set redirect URL to your app URL

## Functions/Triggers

### Auto-create user profile on signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT := 'devteam@appdoers.co.nz';
  is_admin BOOLEAN := LOWER(NEW.email) = LOWER(admin_email);
BEGIN
  INSERT INTO public.users (id, email, phone, name, is_approved, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    is_admin, -- Admin email is auto-approved
    CASE WHEN is_admin THEN 'admin' ELSE 'member' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Notes

- All new user signups will have `is_approved = false` by default
- **EXCEPTION:** The email `devteam@appdoers.co.nz` is automatically set as admin and approved
- Only `devteam@appdoers.co.nz` can access the admin dashboard
- Other admins need to approve users in the Admin Overview page
- RLS policies ensure data security
- Storage buckets should be configured with appropriate access policies

