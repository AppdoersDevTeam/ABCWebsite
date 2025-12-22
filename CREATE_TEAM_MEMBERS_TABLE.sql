-- Create Team Members Table
-- This table stores staff and leadership team member information

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  img TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read team members (public directory)
CREATE POLICY "Authenticated users can read team members" ON team_members
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admins can manage team members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();

-- Insert initial team members (optional - can be removed if you want to start fresh)
-- Uncomment the following if you want to seed initial data:
/*
INSERT INTO team_members (name, role, email, phone, img) VALUES
  ('Alex Johnson', 'Youth Pastor', 'alex@church.com', '03-308 5409', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'),
  ('Maria Garcia', 'Worship Leader', 'maria@church.com', '03-308 5410', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'),
  ('James Wilson', 'Elder', 'james@church.com', '03-308 5411', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'),
  ('Linda Chen', 'Admin', 'linda@church.com', '03-308 5412', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80'),
  ('Robert Taylor', 'Facilities', 'robert@church.com', '03-308 5413', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
  ('Patricia Lee', 'Children''s Ministry', 'patricia@church.com', '03-308 5414', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80');
*/


