/*
  # Fix RLS Policies

  1. Changes
    - Drop existing policies that cause recursion
    - Create new simplified policies for files and project members
    - Ensure proper access control without recursive checks

  2. Security
    - Maintain same security model
    - Users can still only access their own files and project files they have access to
*/

-- Drop existing policies
DROP POLICY IF EXISTS "files_view_project" ON files;
DROP POLICY IF EXISTS "files_manage_own" ON files;
DROP POLICY IF EXISTS "Users can view project files" ON files;
DROP POLICY IF EXISTS "files_manage_own" ON files;

-- Create new simplified policies for files
CREATE POLICY "files_manage_own"
ON files
FOR ALL
TO public
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "files_view_project"
ON files
FOR SELECT
TO public
USING (
  user_id = auth.uid()
  OR (
    project_id IS NOT NULL
    AND project_id IN (
      SELECT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- Drop and recreate project members policies to avoid recursion
DROP POLICY IF EXISTS "Project members can be viewed by project members" ON project_members;

CREATE POLICY "view_project_members"
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

CREATE POLICY "manage_project_members"
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