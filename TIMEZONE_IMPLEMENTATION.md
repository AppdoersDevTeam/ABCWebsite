# Timezone-Aware Date Implementation

This document describes the timezone-aware date and time implementation for prayer requests and user signups.

## Overview

The system now:
1. **Stores timezone information** when users create prayer requests or sign up
2. **Displays dates to admins** in the admin's current timezone
3. **Preserves original timezone** information for reference

## Database Setup

### Step 1: Add Timezone Columns

Run the SQL migration file to add timezone columns to the database:

```sql
-- Run this in Supabase Dashboard > SQL Editor
-- File: ADD_TIMEZONE_COLUMNS.sql
```

This adds:
- `user_timezone` column to `prayer_requests` table
- `user_timezone` column to `users` table

### Step 2: Update User Trigger

Update the user creation trigger to capture timezone from signup metadata:

```sql
-- Run this in Supabase Dashboard > SQL Editor
-- File: FIX_USER_TRIGGER.sql (already updated)
```

The trigger now extracts timezone from `raw_user_meta_data->>'timezone'` when users sign up.

## How It Works

### For Prayer Requests

1. **When a user creates a prayer request:**
   - The system captures their current timezone (e.g., `America/New_York`)
   - Stores it in the `user_timezone` column
   - The `created_at` timestamp is stored in UTC (as before)

2. **When an admin views prayer requests:**
   - Dates are displayed in the admin's current timezone
   - The system uses the stored `user_timezone` for reference
   - Format: Relative dates (e.g., "2 hours ago", "3 days ago") or full date/time

### For User Signups

1. **When a user signs up:**
   - Timezone is captured from the browser
   - Stored in user metadata during signup
   - Extracted by the database trigger and stored in `users.user_timezone`
   - If timezone is missing, it's set when the user profile is fetched

2. **When an admin views user signups:**
   - Signup dates are displayed in the admin's current timezone
   - Format: Relative dates (e.g., "1 day ago") or full date/time

## Files Modified

### New Files
- `lib/dateUtils.ts` - Timezone-aware date formatting utilities
- `ADD_TIMEZONE_COLUMNS.sql` - Database migration
- `TIMEZONE_IMPLEMENTATION.md` - This file

### Updated Files
- `types.ts` - Added `user_timezone` to `PrayerRequest` and `User` interfaces
- `FIX_USER_TRIGGER.sql` - Updated to capture timezone from metadata
- `context/AuthContext.tsx` - Updated signup functions to include timezone
- `pages/public/NeedPrayer.tsx` - Captures timezone when creating prayer requests
- `pages/dashboard/PrayerWall.tsx` - Captures timezone and uses timezone-aware formatting
- `pages/admin/AdminPrayerWall.tsx` - Captures timezone and uses timezone-aware formatting
- `pages/admin/AdminUsers.tsx` - Uses timezone-aware date formatting
- `pages/admin/AdminOverview.tsx` - Uses timezone-aware date formatting

## Utility Functions

### `getUserTimezone()`
Returns the current user's IANA timezone identifier (e.g., `America/New_York`).

### `formatRelativeDateInTimezone(dateString, originalTimezone?, adminTimezone?)`
Formats a date as a relative string (e.g., "2 hours ago") in the specified timezone.

### `formatFullDateTimeInTimezone(dateString, originalTimezone?, adminTimezone?)`
Formats a date with full date and time information in the specified timezone.

## Testing

1. **Test Prayer Request Creation:**
   - Create a prayer request from different timezones
   - Verify `user_timezone` is stored correctly
   - Check admin view shows dates in admin's timezone

2. **Test User Signup:**
   - Sign up a new user
   - Verify `user_timezone` is stored in the database
   - Check admin view shows signup date in admin's timezone

3. **Test Date Display:**
   - View prayer requests as admin from different timezones
   - Verify dates are displayed correctly in admin's current timezone
   - Check that relative dates (e.g., "2 hours ago") are accurate

## Notes

- All timestamps in the database remain in UTC (standard practice)
- Timezone information is stored as IANA timezone identifiers (e.g., `America/New_York`)
- The system automatically detects the user's timezone from their browser
- If timezone detection fails, the system falls back to UTC
- Admins see dates in their current timezone, regardless of where the original action occurred

