/*
  # Fix Project Members Policy

  1. Changes
    - Update the files_view_project policy to avoid recursion
    - Add proper join conditions to prevent infinite recursion

  2. Security
    - Maintain existing security model
    - Ensure proper access control
*/

-- Drop existing policy
DROP POLICY IF EXISTS "files_view_project" ON files;

-- Create updated policy without recursion
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