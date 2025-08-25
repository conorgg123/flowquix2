/*
  # Enhanced Task Management Schema

  1. Updates
    - Add new columns to tasks table:
      - assigned_to (for task assignment)
      - project_id (for project association)
      - position (for drag and drop ordering)
      - tags (array of strings)
    - Add indexes for better performance
    - Update RLS policies

  2. Changes
    - Modify existing tasks table
    - Add position-based ordering
    - Add tags support
    - Add task assignment support
    - Add project association
*/

-- Add new columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create index for position ordering
CREATE INDEX IF NOT EXISTS tasks_position_idx ON tasks(position);

-- Create index for user_id and status combination
CREATE INDEX IF NOT EXISTS tasks_user_status_idx ON tasks(user_id, status);

-- Create index for assigned tasks
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON tasks(assigned_to);

-- Create index for project tasks
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);

-- Update RLS policies
CREATE POLICY "Users can view assigned tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR assigned_to = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects
    JOIN project_members ON project_members.project_id = projects.id
    WHERE projects.id = tasks.project_id
    AND project_members.user_id = auth.uid()
  )
);