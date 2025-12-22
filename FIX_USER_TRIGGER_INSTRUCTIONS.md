# How to Fix the User Profile Creation Trigger

## The Problem
Users sign up successfully but their profiles aren't created in `public.users` table because the database trigger isn't working or doesn't exist.

## Why Service Role is Needed
The trigger needs to access `auth.users` table, which requires elevated privileges. The `service_role` key has full database privileges and can create triggers on the `auth` schema.

## Method 1: Supabase Dashboard (Easiest - Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on **SQL Editor** in the left sidebar

2. **Run the SQL**
   - The SQL Editor automatically uses service_role privileges
   - Copy the contents of `FIX_USER_TRIGGER.sql`
   - Paste into the SQL Editor
   - Click **Run** or press `Ctrl+Enter`

3. **Verify it worked**
   - Check the output for any errors
   - The last two SELECT statements will show if the trigger and function exist

## Method 2: Using psql (Command Line)

1. **Get your connection string**
   - Go to Supabase Dashboard → Settings → Database
   - Find your connection string or use:
     ```
     postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - Replace `[PROJECT_REF]`, `[PASSWORD]`, and `[REGION]` with your actual values

2. **Run the SQL**
   ```bash
   export SUPABASE_DB_URL="postgres://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   psql "$SUPABASE_DB_URL" -f FIX_USER_TRIGGER.sql
   ```

   Or paste the SQL directly:
   ```bash
   psql "$SUPABASE_DB_URL" -c "$(cat FIX_USER_TRIGGER.sql)"
   ```

## Method 3: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Link your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Run the SQL file**
   ```bash
   supabase db execute --file FIX_USER_TRIGGER.sql
   ```

## Method 4: Using Supabase AI

1. **Go to Supabase Dashboard**
   - Navigate to SQL Editor
   - Look for AI Assistant or Claude

2. **Use the prompt**
   - Copy the prompt from `SUPABASE_AI_FIX_USER_TRIGGER.md`
   - Paste it into the AI assistant
   - Review the generated SQL
   - Execute it in the SQL Editor (which uses service_role)

## Verification Steps

After running the SQL, verify it worked:

1. **Check the function exists:**
   ```sql
   SELECT routine_name, routine_type
   FROM information_schema.routines
   WHERE routine_schema = 'public'
     AND routine_name = 'handle_new_user';
   ```
   Should return 1 row.

2. **Check the trigger exists:**
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table
   FROM information_schema.triggers
   WHERE trigger_name = 'on_auth_user_created';
   ```
   Should return 1 row with `event_object_table = 'users'`.

3. **Test with a new signup:**
   - Have someone sign up (or create a test account)
   - Check if a profile appears in `public.users` table
   - The profile should be created automatically

## Troubleshooting

### If you get "permission denied" errors:
- Make sure you're using service_role (Dashboard SQL Editor does this automatically)
- Don't run this from client-side code
- Use one of the methods above

### If the trigger still doesn't work:
- Check Supabase logs for errors
- Verify the function has SECURITY DEFINER
- Make sure the `public.users` table exists and has the correct structure
- Check that RLS policies allow the function to insert

### If users still don't get profiles:
- The trigger might not be firing
- Check if there are any errors in the function
- Verify the trigger is attached to the correct table (`auth.users`)
- Test by manually inserting into `auth.users` (in a test environment)

## Security Note

⚠️ **Never expose your service_role key in client-side code or public repositories!**

The service_role key has full database access. Only use it:
- In Supabase Dashboard SQL Editor
- In secure server-side code
- In local development environments
- Never in browser/client JavaScript


