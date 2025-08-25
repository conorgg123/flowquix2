/*
  # Core Features Schema Implementation

  1. New Tables
    - workspaces
      - Central organization unit for teams and projects
    - workspace_members
      - Manages workspace access and permissions
    - kanban_boards
      - Visual project management boards
    - kanban_columns
      - Columns for kanban boards (e.g., To Do, In Progress)
    - kanban_cards
      - Cards representing tasks on kanban boards
    - comments
      - Comments on tasks, projects, and other items
    - time_entries
      - Time tracking records
    - notifications
      - System notifications
    - audit_logs
      - Activity tracking across the platform

  2. Security
    - Enable RLS on all tables
    - Add appropriate access policies
    - Implement role-based permissions
*/

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Workspace Members
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member', 'guest'))
);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Kanban Boards
CREATE TABLE IF NOT EXISTS kanban_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;

-- Kanban Columns
CREATE TABLE IF NOT EXISTS kanban_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;

-- Kanban Cards
CREATE TABLE IF NOT EXISTS kanban_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id uuid NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date timestamptz,
  position integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_entity_type CHECK (entity_type IN ('task', 'project', 'card'))
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('info', 'success', 'warning', 'error'))
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Workspaces
CREATE POLICY "Users can view workspaces they belong to"
ON workspaces
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace owners and admins can manage workspace"
ON workspaces
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role IN ('owner', 'admin')
  )
);

-- Workspace Members
CREATE POLICY "Users can view members of their workspaces"
ON workspace_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace owners and admins can manage members"
ON workspace_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);

-- Kanban Boards
CREATE POLICY "Users can view boards in their workspaces"
ON kanban_boards
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = kanban_boards.workspace_id
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage boards they created"
ON kanban_boards
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Kanban Columns
CREATE POLICY "Users can view columns of accessible boards"
ON kanban_columns
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kanban_boards
    JOIN workspace_members ON workspace_members.workspace_id = kanban_boards.workspace_id
    WHERE kanban_boards.id = kanban_columns.board_id
    AND workspace_members.user_id = auth.uid()
  )
);

-- Kanban Cards
CREATE POLICY "Users can view cards in their workspaces"
ON kanban_cards
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kanban_columns
    JOIN kanban_boards ON kanban_boards.id = kanban_columns.board_id
    JOIN workspace_members ON workspace_members.workspace_id = kanban_boards.workspace_id
    WHERE kanban_columns.id = kanban_cards.column_id
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage cards they created or are assigned to"
ON kanban_cards
FOR ALL
TO authenticated
USING (
  created_by = auth.uid()
  OR assigned_to = auth.uid()
)
WITH CHECK (
  created_by = auth.uid()
  OR assigned_to = auth.uid()
);

-- Comments
CREATE POLICY "Users can view comments on accessible items"
ON comments
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN entity_type = 'task' THEN
      EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = comments.entity_id
        AND tasks.user_id = auth.uid()
      )
    WHEN entity_type = 'project' THEN
      EXISTS (
        SELECT 1 FROM projects
        JOIN project_members ON project_members.project_id = projects.id
        WHERE projects.id = comments.entity_id
        AND project_members.user_id = auth.uid()
      )
    WHEN entity_type = 'card' THEN
      EXISTS (
        SELECT 1 FROM kanban_cards
        JOIN kanban_columns ON kanban_columns.id = kanban_cards.column_id
        JOIN kanban_boards ON kanban_boards.id = kanban_columns.board_id
        JOIN workspace_members ON workspace_members.workspace_id = kanban_boards.workspace_id
        WHERE kanban_cards.id = comments.entity_id
        AND workspace_members.user_id = auth.uid()
      )
    ELSE false
  END
);

CREATE POLICY "Users can manage their own comments"
ON comments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can manage their own notifications"
ON notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Audit Logs
CREATE POLICY "Users can view audit logs for their workspaces"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN entity_type = 'workspace' THEN
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = audit_logs.entity_id::uuid
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role IN ('owner', 'admin')
      )
    WHEN entity_type IN ('board', 'column', 'card') THEN
      EXISTS (
        SELECT 1 FROM kanban_boards
        JOIN workspace_members ON workspace_members.workspace_id = kanban_boards.workspace_id
        WHERE kanban_boards.id = audit_logs.entity_id::uuid
        AND workspace_members.user_id = auth.uid()
        AND workspace_members.role IN ('owner', 'admin')
      )
    ELSE false
  END
);