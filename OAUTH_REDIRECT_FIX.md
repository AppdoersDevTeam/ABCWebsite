# Fix OAuth Redirect to Localhost Issue

## Problem
Google OAuth is redirecting to `http://localhost:3000` instead of your production URL when deployed on Vercel.

## Root Cause
Supabase uses its **Site URL** setting as the primary redirect destination. Even if you pass `redirectTo` in your code, Supabase may override it with the Site URL configured in the dashboard.

## Solution (CRITICAL - Do This First!)

### Step 1: Update Supabase Site URL (MOST IMPORTANT)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Authentication** → **URL Configuration**
4. Find the **Site URL** field
5. **Change it from `http://localhost:3000` to your production URL:**
   - `https://ashburtonbaptistchurch.vercel.app` OR
   - `https://www.ashburtonbaptist.co.nz` (if you have a custom domain)
6. **DO NOT include a trailing slash**
7. Click **Save**

**This is the #1 cause of the localhost redirect issue!**

### Step 2: Set Environment Variable in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Key:** `VITE_SITE_URL`
   - **Value:** Your production URL (same as Supabase Site URL)
     - `https://ashburtonbaptistchurch.vercel.app` OR
     - `https://www.ashburtonbaptist.co.nz`
   - **Environment:** Production (and Preview if desired)
5. **DO NOT include a trailing slash**
6. Click **Save**

### Step 3: Redeploy

After making these changes:
1. **Redeploy your Vercel application** (the environment variable change requires a new deployment)
2. Wait for deployment to complete
3. Test the Google OAuth login

## Verification Checklist

- [ ] Supabase Site URL is set to production URL (not localhost)
- [ ] Vercel environment variable `VITE_SITE_URL` is set to production URL
- [ ] No trailing slashes in either URL
- [ ] Application has been redeployed after changes
- [ ] Browser cache cleared (or test in incognito mode)

## Debugging

If it's still redirecting to localhost after the above steps:

1. **Check the browser console** - Look for the log message:
   ```
   signInWithGoogle - Final redirect URL: ...
   ```
   This will show what URL the code is trying to use.

2. **Verify environment variable is loaded:**
   - The console should show: `Using VITE_SITE_URL from environment: ...`
   - If it shows `NOT SET`, the environment variable isn't configured correctly

3. **Double-check Supabase Site URL:**
   - Go back to Supabase Dashboard → Settings → Authentication → URL Configuration
   - Verify the Site URL is definitely your production URL

4. **Check Google Cloud Console:**
   - Ensure your production URL is in the **Authorized redirect URIs** list
   - Should include: `https://your-production-url.com` (without trailing slash)

## Common Mistakes

❌ **Wrong:** Site URL = `http://localhost:3000`  
✅ **Right:** Site URL = `https://ashburtonbaptistchurch.vercel.app`

❌ **Wrong:** Site URL = `https://ashburtonbaptistchurch.vercel.app/` (trailing slash)  
✅ **Right:** Site URL = `https://ashburtonbaptistchurch.vercel.app`

❌ **Wrong:** Not redeploying after setting environment variable  
✅ **Right:** Always redeploy after changing environment variables

## Still Not Working?

If you've completed all steps and it's still not working:

1. Check that you're testing on the **production deployment**, not a preview deployment
2. Clear your browser's cookies and cache completely
3. Try in an incognito/private window
4. Check the Network tab in browser DevTools to see what redirect URL is actually being sent to Supabase
5. Verify the Supabase project you're using matches the one configured in your Vercel environment variables

