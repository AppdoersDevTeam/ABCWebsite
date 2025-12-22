-- Add timezone columns to prayer_requests and users tables
-- This allows us to store the timezone when a prayer request or user signup was created
-- and display dates to admins in their current timezone

-- Add user_timezone column to prayer_requests table
-- This stores the IANA timezone identifier (e.g., 'America/New_York', 'Europe/London')
ALTER TABLE prayer_requests 
ADD COLUMN IF NOT EXISTS user_timezone TEXT;

-- Add user_timezone column to users table
-- This stores the timezone when the user signed up
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_timezone TEXT;

-- Add index for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_timezone ON prayer_requests(user_timezone);
CREATE INDEX IF NOT EXISTS idx_users_user_timezone ON users(user_timezone);

-- Add comment to document the columns
COMMENT ON COLUMN prayer_requests.user_timezone IS 'IANA timezone identifier (e.g., America/New_York) when the prayer request was created';
COMMENT ON COLUMN users.user_timezone IS 'IANA timezone identifier (e.g., America/New_York) when the user signed up';


