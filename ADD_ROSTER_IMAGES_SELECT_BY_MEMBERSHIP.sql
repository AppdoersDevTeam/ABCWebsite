-- Replace broad roster read policy with ministry-based access for members.
-- Admins keep full access via existing "Admins can manage roster PDFs" FOR ALL policy.
-- Run in Supabase SQL Editor after ADD_TEAM_MEMBERS_USER_ID.sql (team_members.user_id should exist).

DROP POLICY IF EXISTS "Authenticated users can read roster PDFs" ON roster_images;

CREATE POLICY "Members read roster PDFs for their ministries" ON roster_images
  FOR SELECT
  TO authenticated
  USING (
    roster_images.group_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM team_members tm
      INNER JOIN team_member_groups tmg ON tmg.team_member_id = tm.id
      WHERE tm.user_id = auth.uid()
        AND tmg.group_id = roster_images.group_id
    )
  );

COMMENT ON POLICY "Members read roster PDFs for their ministries" ON roster_images IS
  'Members may only SELECT roster PDF rows for groups they belong to (Directory team_member_groups).';
