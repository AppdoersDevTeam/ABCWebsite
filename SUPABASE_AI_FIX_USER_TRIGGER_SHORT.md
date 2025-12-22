# Quick Supabase AI Prompt - Fix User Trigger

Copy this into Supabase AI:

---

Users sign up but profiles aren't created in `public.users`. Need trigger on `auth.users` INSERT that:

1. Creates record in `public.users` with same `id`
2. Sets `email`, `phone`, `name` from auth record/metadata
3. If email = `devteam@appdoers.co.nz`: `role='admin'`, `is_approved=true`
4. Otherwise: `role='member'`, `is_approved=false`
5. Name from `raw_user_meta_data->>'full_name'` or email prefix or 'User'

Check if `handle_new_user()` function exists, fix or create it, attach trigger to `auth.users`. Use SECURITY DEFINER. 

**CRITICAL**: Must run with service_role (Supabase Dashboard SQL Editor works automatically, or use psql/CLI with service_role). Provide complete SQL and execution instructions.

---

