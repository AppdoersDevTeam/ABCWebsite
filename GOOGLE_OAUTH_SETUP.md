# Google OAuth Setup for Supabase

## The Problem
When using Supabase with Google OAuth, Supabase handles the OAuth callback through its own endpoint, not your app's URL. This causes a `redirect_uri_mismatch` error if the Supabase callback URL isn't added to Google Cloud Console.

## Solution

### Step 1: Add Supabase Callback URL to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:

```
https://zwxlccqhafdnvdohzxkg.supabase.co/auth/v1/callback
```

**Important:** Replace `zwxlccqhafdnvdohzxkg` with your actual Supabase project reference if different.

### Step 2: Complete List of Authorized Redirect URIs

Your Google OAuth configuration should include:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://www.ashburtonbaptist.co.nz
https://ashburtonbaptistchurch.vercel.app
```

**Authorized redirect URIs:**
```
http://localhost:3000
https://www.ashburtonbaptist.co.nz/
https://ashburtonbaptistchurch.vercel.app
https://zwxlccqhafdnvdohzxkg.supabase.co/auth/v1/callback
```

### Step 3: Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
5. Set the **Redirect URL** in Supabase to:
   ```
   https://zwxlccqhafdnvdohzxkg.supabase.co/auth/v1/callback
   ```

### Step 4: How to Find Your Supabase Project Reference

1. Go to your Supabase Dashboard
2. Click on **Settings** > **API**
3. Your **Project URL** will be something like: `https://xxxxx.supabase.co`
4. The `xxxxx` part is your project reference
5. Use it in the callback URL: `https://xxxxx.supabase.co/auth/v1/callback`

## How It Works

1. User clicks "Sign in with Google"
2. User is redirected to Google for authentication
3. Google redirects back to Supabase's callback URL: `https://[project-ref].supabase.co/auth/v1/callback`
4. Supabase processes the OAuth response
5. Supabase redirects to your app's `redirectTo` URL (configured in code)
6. Your app receives the authenticated session

## Testing

After adding the Supabase callback URL:
1. Save changes in Google Cloud Console
2. Wait a few minutes for changes to propagate
3. Try signing in with Google again
4. The error should be resolved

## Notes

- The Supabase callback URL is **required** - this is how Supabase handles OAuth
- Your app's redirect URLs are still needed for the final redirect after Supabase processes the OAuth
- Make sure there are no trailing slashes inconsistencies (except where noted)
- Changes in Google Cloud Console can take a few minutes to take effect

