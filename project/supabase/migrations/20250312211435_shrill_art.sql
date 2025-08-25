/*
  # Add Time Tracking Tables

  1. New Tables
    - time_entries: Stores time tracking records
      - id (uuid, primary key)
      - description (text)
      - start_time (timestamptz)
      - end_time (timestamptz, nullable)
      - duration (interval)
      - user_id (uuid, references auth.users)
      - project_id (uuid, references projects)
      - task_id (uuid, references tasks)

  2. Security
    - Enable RLS
    - Users can manage their own time entries
    - Project members can view project time entries
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Project members can view project time entries" ON time_entries;

-- Create time_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration interval GENERATED ALWAYS AS (end_time - start_time) STORED,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS time_entries_user_id_idx ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS time_entries_project_id_idx ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS time_entries_task_id_idx ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS time_entries_start_time_idx ON time_entries(start_time);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies with new names to avoid conflicts
CREATE POLICY "time_entries_manage_own"
ON time_entries
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "time_entries_view_project"
ON time_entries
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id 
    FROM project_members 
    WHERE user_id = auth.uid()
  )
);