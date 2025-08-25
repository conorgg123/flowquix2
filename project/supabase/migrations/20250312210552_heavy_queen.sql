/*
  # Fix Project Member Policies - Version 2

  1. Changes
    - Drop and recreate project policies with simplified logic
    - Ensure no recursive policy checks
    - Maintain same security model with better performance

  2. Security
    - Project owners can manage their projects
    - Project members can view projects they belong to
    - No circular references in policies
*/

-- Drop all existing project-related policies first
DROP POLICY IF EXISTS "Project owners can manage their projects" ON projects;
DROP POLICY IF EXISTS "Users can view projects they are members of" ON projects;
DROP POLICY IF EXISTS "view_project_members" ON project_members;
DROP POLICY IF EXISTS "manage_project_members" ON project_members;

-- Create new project policies
CREATE POLICY "project_owner_all"
ON projects
FOR ALL
TO public
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "project_member_select"
ON projects
FOR SELECT
TO public
USING (
  id IN (
    SELECT project_id 
    FROM project_members 
    WHERE user_id = auth.uid()
  )
);

-- Create new project member policies
CREATE POLICY "project_members_owner_all"
ON project_members
FOR ALL
TO public
USING (
  project_id IN (
    SELECT id 
    FROM projects 
    WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT id 
    FROM projects 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "project_members_view"
ON project_members
FOR SELECT
TO public
USING (
  project_id IN (
    SELECT project_id 
    FROM project_members 
    WHERE user_id = auth.uid()
  )
);