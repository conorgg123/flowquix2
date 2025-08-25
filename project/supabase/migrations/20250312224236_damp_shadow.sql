/*
  # Task Management Enhancements

  1. New Tables
    - task_dependencies: Track task dependencies
    - task_recurrence: Store recurring task patterns
    - task_priorities: AI-driven task priority suggestions

  2. Changes
    - Add voice_transcript column to tasks
    - Add priority_score column for AI suggestions
    - Add recurrence_pattern for recurring tasks
*/

-- Create task_dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Create task_recurrence table
CREATE TABLE IF NOT EXISTS task_recurrence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  pattern text NOT NULL, -- RRule pattern
  next_occurrence timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task_priorities table
CREATE TABLE IF NOT EXISTS task_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  priority_score float NOT NULL,
  factors jsonb NOT NULL, -- Store factors that influenced the score
  created_at timestamptz DEFAULT now()
);

-- Add new columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS voice_transcript text,
ADD COLUMN IF NOT EXISTS priority_score float,
ADD COLUMN IF NOT EXISTS recurrence_pattern text,
ADD COLUMN IF NOT EXISTS smart_suggestions jsonb DEFAULT '{}';

-- Enable RLS on new tables
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_recurrence ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_priorities ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS task_dependencies_task_id_idx ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS task_dependencies_depends_on_idx ON task_dependencies(depends_on_task_id);
CREATE INDEX IF NOT EXISTS task_recurrence_task_id_idx ON task_recurrence(task_id);
CREATE INDEX IF NOT EXISTS task_recurrence_next_idx ON task_recurrence(next_occurrence);
CREATE INDEX IF NOT EXISTS task_priorities_task_id_idx ON task_priorities(task_id);
CREATE INDEX IF NOT EXISTS task_priorities_score_idx ON task_priorities(priority_score);

-- Create policies for task_dependencies
CREATE POLICY "Users can view task dependencies"
ON task_dependencies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_dependencies.task_id
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

CREATE POLICY "Users can manage task dependencies"
ON task_dependencies
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_dependencies.task_id
    AND tasks.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_dependencies.task_id
    AND tasks.user_id = auth.uid()
  )
);

-- Create policies for task_recurrence
CREATE POLICY "Users can view task recurrence"
ON task_recurrence
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_recurrence.task_id
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

CREATE POLICY "Users can manage task recurrence"
ON task_recurrence
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_recurrence.task_id
    AND tasks.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_recurrence.task_id
    AND tasks.user_id = auth.uid()
  )
);

-- Create policies for task_priorities
CREATE POLICY "Users can view task priorities"
ON task_priorities
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_priorities.task_id
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

-- Function to calculate task priority score
CREATE OR REPLACE FUNCTION calculate_task_priority(
  p_task_id uuid
) RETURNS float AS $$
DECLARE
  v_score float;
  v_task tasks;
BEGIN
  -- Get task details
  SELECT * INTO v_task
  FROM tasks
  WHERE id = p_task_id;

  -- Base score
  v_score := CASE v_task.priority
    WHEN 'high' THEN 3.0
    WHEN 'medium' THEN 2.0
    WHEN 'low' THEN 1.0
  END;

  -- Adjust for due date proximity
  IF v_task.due_date IS NOT NULL THEN
    v_score := v_score + (1.0 / GREATEST(1, EXTRACT(DAY FROM v_task.due_date - now())));
  END IF;

  -- Adjust for dependencies
  v_score := v_score + (
    SELECT COUNT(*)::float * 0.5
    FROM task_dependencies
    WHERE task_id = p_task_id
  );

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle recurring tasks
CREATE OR REPLACE FUNCTION handle_recurring_tasks() RETURNS void AS $$
DECLARE
  v_task tasks;
  v_recurrence task_recurrence;
  v_new_task_id uuid;
BEGIN
  -- Find recurring tasks that need new instances
  FOR v_recurrence IN
    SELECT *
    FROM task_recurrence
    WHERE next_occurrence <= now()
  LOOP
    -- Get original task
    SELECT * INTO v_task
    FROM tasks
    WHERE id = v_recurrence.task_id;

    -- Create new task instance
    INSERT INTO tasks (
      title,
      description,
      status,
      priority,
      user_id,
      project_id,
      assigned_to,
      due_date,
      tags,
      position
    )
    VALUES (
      v_task.title,
      v_task.description,
      'pending',
      v_task.priority,
      v_task.user_id,
      v_task.project_id,
      v_task.assigned_to,
      v_recurrence.next_occurrence,
      v_task.tags,
      v_task.position
    )
    RETURNING id INTO v_new_task_id;

    -- Update next occurrence
    UPDATE task_recurrence
    SET next_occurrence = next_occurrence + interval '1 day'
    WHERE id = v_recurrence.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;