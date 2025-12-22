# Supabase AI Prompt - Fix User Profile Creation Trigger

Copy and paste this entire prompt into Supabase AI (Claude in the Supabase Dashboard):

---

**PROMPT FOR SUPABASE AI:**

I have an issue with user profile creation in my Supabase database. When users sign up (via email, phone, or Google OAuth), their account is created in `auth.users` but a corresponding profile is NOT being created in the `public.users` table.

## Current Situation

- Users can sign up successfully
- They appear in `auth.users` table
- They do NOT appear in `public.users` table
- This means they can't be approved or access the application

## Required Fix

I need a database trigger that automatically creates a user profile in `public.users` whenever a new user is inserted into `auth.users`.

## Database Schema

The `public.users` table has this structure:
- `id` (UUID, PRIMARY KEY, REFERENCES auth.users(id))
- `email` (TEXT, nullable)
- `phone` (TEXT, nullable)
- `name` (TEXT, NOT NULL)
- `is_approved` (BOOLEAN, DEFAULT false)
- `role` (TEXT, DEFAULT 'member', CHECK constraint: must be 'member' or 'admin')
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

## Special Requirements

1. **Admin Email Exception**: If the user's email is `devteam@appdoers.co.nz` (case-insensitive), they should be automatically:
   - Set as `role = 'admin'`
   - Set as `is_approved = true`

2. **All Other Users**: Should be:
   - Set as `role = 'member'`
   - Set as `is_approved = false`

3. **Name Field**: Should be populated from:
   - `raw_user_meta_data->>'full_name'` if available
   - Otherwise, use the email address (part before @)
   - If email is also missing, use 'User' as fallback

4. **Email and Phone**: Should be extracted from the auth.users record

## What I Need

Please:
1. Check if a trigger function `handle_new_user()` exists
2. If it exists, verify it's working correctly and fix any issues
3. If it doesn't exist, create it
4. Ensure the trigger is properly attached to `auth.users` table
5. Make sure it handles all signup methods (email, phone, Google OAuth)
6. Test that it works for both regular users and the admin email

## Expected Behavior

When a new user signs up:
- Trigger fires AFTER INSERT on `auth.users`
- Creates a corresponding record in `public.users` with:
  - Same `id` as the auth user
  - Email from `auth.users.email`
  - Phone from `auth.users.phone`
  - Name from metadata or email
  - `is_approved = false` (or `true` for admin email)
  - `role = 'member'` (or `'admin'` for admin email)

## SQL I Need

Please provide:
1. The complete trigger function SQL
2. The trigger creation SQL
3. Any necessary permissions or grants
4. Instructions on how to verify it's working
5. **IMPORTANT**: Instructions on how to run this with service_role privileges

The function should use `SECURITY DEFINER` to ensure it has proper permissions to insert into `public.users`.

**CRITICAL**: The CREATE FUNCTION and CREATE TRIGGER statements must be executed with service_role privileges because they need to access the `auth.users` table. In Supabase, this can be done by:
- Running the SQL in the Supabase Dashboard SQL Editor (which uses service_role automatically)
- OR using psql with the service_role connection string
- OR using Supabase CLI with service_role

Please include clear instructions on how to execute the SQL with the proper privileges.

---

**END OF PROMPT**

