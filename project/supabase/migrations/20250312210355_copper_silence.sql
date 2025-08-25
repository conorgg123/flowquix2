/*
  # Fix Project Members Policy

  1. Changes
    - Drop existing policies that may cause recursion
    - Create new simplified policies for files table
    - Ensure proper access control without recursive checks

  2. Security
    - Maintain same security model
    - Users can still only access their own files and project files they have access to
*/

-- Drop existing policies
DROP POLICY IF EXISTS "files_view_project" ON files;
DROP POLICY IF EXISTS "files_manage_own" ON files;

-- Create new simplified policies
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