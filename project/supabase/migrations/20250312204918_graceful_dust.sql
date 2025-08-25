/*
  # Consolidate Task Table Changes

  1. Changes
    - Add new columns to tasks table:
      - assigned_to (uuid, foreign key to auth.users)
      - project_id (uuid, foreign key to projects)
      - position (integer)
      - tags (text array)
    - Create necessary indexes for performance
    - Update RLS policies for proper access control

  2. Security
    - Maintain existing RLS
    - Add policy for viewing assigned tasks
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view assigned tasks" ON tasks;

-- Add new columns to tasks table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_to') THEN
    ALTER TABLE tasks ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'project_id') THEN
    ALTER TABLE tasks ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'position') THEN
    ALTER TABLE tasks ADD COLUMN position integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'tags') THEN
    ALTER TABLE tasks ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS tasks_position_idx ON tasks(position);
CREATE INDEX IF NOT EXISTS tasks_user_status_idx ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);

-- Create new RLS policy for viewing assigned tasks
CREATE POLICY "Users can view assigned tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR assigned_to = auth.uid()
  OR (
    project_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
      AND project_members.user_id = auth.uid()
    )
  )
);