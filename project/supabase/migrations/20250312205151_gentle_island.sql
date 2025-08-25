/*
  # Add Task Comments and Activity Features

  1. New Tables
    - task_comments
      - id (uuid, primary key)
      - task_id (uuid, foreign key to tasks)
      - user_id (uuid, foreign key to auth.users)
      - content (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - task_activity
      - id (uuid, primary key)
      - task_id (uuid, foreign key to tasks)
      - user_id (uuid, foreign key to auth.users)
      - action (text)
      - details (jsonb)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing comments
    - Add policies for viewing task activity
*/

-- Task Comments
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Task Activity
CREATE TABLE IF NOT EXISTS task_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS task_comments_task_id_idx ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS task_comments_user_id_idx ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS task_activity_task_id_idx ON task_activity(task_id);
CREATE INDEX IF NOT EXISTS task_activity_user_id_idx ON task_activity(user_id);

-- Comments Policies
CREATE POLICY "Users can view comments on accessible tasks"
ON task_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_comments.task_id
    AND (
      tasks.user_id = auth.uid()
      OR tasks.assigned_to = auth.uid()
      OR (
        tasks.project_id IS NOT NULL 
        AND EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = tasks.project_id
          AND project_members.user_id = auth.uid()
        )
      )
    )
  )
);

CREATE POLICY "Users can manage their own comments"
ON task_comments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Activity Policies
CREATE POLICY "Users can view activity on accessible tasks"
ON task_activity
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_activity.task_id
    AND (
      tasks.user_id = auth.uid()
      OR tasks.assigned_to = auth.uid()
      OR (
        tasks.project_id IS NOT NULL 
        AND EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = tasks.project_id
          AND project_members.user_id = auth.uid()
        )
      )
    )
  )
);