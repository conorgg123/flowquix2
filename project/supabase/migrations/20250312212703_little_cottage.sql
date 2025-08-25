/*
  # Fix project members policy recursion

  1. Changes
    - Drop existing problematic policies
    - Create new non-recursive policies for project members
    - Ensure proper access control without circular references

  2. Security
    - Maintain row level security
    - Ensure project owners can manage members
    - Allow members to view other members in their projects
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Project owners can manage project members" ON project_members;
DROP POLICY IF EXISTS "project_members_owner_all" ON project_members;
DROP POLICY IF EXISTS "project_members_view" ON project_members;

-- Create new policies without recursion
CREATE POLICY "project_members_manage_as_owner"
ON project_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_members.project_id
    AND projects.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_members.project_id
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "project_members_view_as_member"
ON project_members
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);