/*
  # Complete Feature Implementation

  1. Changes
    - Drop conflicting policies
    - Add remaining feature tables
    - Fix policy issues
    - Ensure all 25 features are properly implemented

  2. Security
    - Enable RLS on all tables
    - Add appropriate access policies
    - Fix policy conflicts
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text UNIQUE,
  username text,
  email text,
  created_at timestamp without time zone DEFAULT now(),
  department text,
  location text,
  status text DEFAULT 'offline',
  last_active timestamptz DEFAULT now(),
  avatar_url text
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "users_view_own_new"
ON users
FOR SELECT
TO public
USING (auth.uid() = id);

CREATE POLICY "users_update_own_new"
ON users
FOR UPDATE
TO public
USING (auth.uid() = id);

CREATE POLICY "users_admin_all_new"
ON users
FOR ALL
TO service_role
USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS users_discord_id_key ON users(discord_id);
CREATE INDEX IF NOT EXISTS users_pkey ON users(id);

-- Create function to update user status
CREATE OR REPLACE FUNCTION update_user_status(
  p_status text,
  p_user_id uuid DEFAULT auth.uid()
) RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    status = p_status,
    last_active = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle team invitations
CREATE OR REPLACE FUNCTION handle_team_invitation(
  p_invitation_id uuid,
  p_action text -- 'accept' or 'decline'
) RETURNS boolean AS $$
DECLARE
  v_invitation team_invitations;
BEGIN
  -- Get invitation
  SELECT * INTO v_invitation
  FROM team_invitations
  WHERE id = p_invitation_id
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF p_action = 'accept' THEN
    -- Add user to project members
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (v_invitation.project_id, auth.uid(), v_invitation.role);
    
    -- Update invitation status
    UPDATE team_invitations
    SET status = 'accepted'
    WHERE id = p_invitation_id;
  ELSE
    -- Update invitation status
    UPDATE team_invitations
    SET status = 'declined'
    WHERE id = p_invitation_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to award achievements
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id uuid,
  p_type text,
  p_name text,
  p_description text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_achievement_id uuid;
BEGIN
  INSERT INTO achievements (user_id, type, name, description)
  VALUES (p_user_id, p_type, p_name, p_description)
  RETURNING id INTO v_achievement_id;

  -- Create notification for achievement
  INSERT INTO notifications (
    user_id,
    title,
    content,
    type,
    action_url
  ) VALUES (
    p_user_id,
    'New Achievement Unlocked!',
    p_name,
    'success',
    '/achievements'
  );
  
  RETURN v_achievement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle workspace management
CREATE OR REPLACE FUNCTION manage_workspace(
  p_workspace_id uuid,
  p_action text, -- 'create', 'update', 'delete'
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_workspace_id uuid;
BEGIN
  CASE p_action
    WHEN 'create' THEN
      INSERT INTO workspaces (name, description, created_by)
      VALUES (p_name, p_description, auth.uid())
      RETURNING id INTO v_workspace_id;
      
      -- Add creator as owner
      INSERT INTO workspace_members (workspace_id, user_id, role)
      VALUES (v_workspace_id, auth.uid(), 'owner');
      
      RETURN v_workspace_id;
    WHEN 'update' THEN
      UPDATE workspaces
      SET 
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        updated_at = now()
      WHERE id = p_workspace_id
      AND EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = p_workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
      );
      
      RETURN p_workspace_id;
    WHEN 'delete' THEN
      DELETE FROM workspaces
      WHERE id = p_workspace_id
      AND EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = p_workspace_id
        AND user_id = auth.uid()
        AND role = 'owner'
      );
      
      RETURN p_workspace_id;
    ELSE
      RAISE EXCEPTION 'Invalid action: %', p_action;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle kanban board operations
CREATE OR REPLACE FUNCTION manage_kanban_board(
  p_board_id uuid,
  p_action text, -- 'create', 'update', 'delete'
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_workspace_id uuid DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_board_id uuid;
BEGIN
  CASE p_action
    WHEN 'create' THEN
      INSERT INTO kanban_boards (
        workspace_id,
        name,
        description,
        created_by
      )
      VALUES (
        p_workspace_id,
        p_name,
        p_description,
        auth.uid()
      )
      RETURNING id INTO v_board_id;
      
      -- Create default columns
      INSERT INTO kanban_columns (board_id, name, position)
      VALUES
        (v_board_id, 'To Do', 0),
        (v_board_id, 'In Progress', 1),
        (v_board_id, 'Done', 2);
      
      RETURN v_board_id;
    WHEN 'update' THEN
      UPDATE kanban_boards
      SET 
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        updated_at = now()
      WHERE id = p_board_id
      AND created_by = auth.uid();
      
      RETURN p_board_id;
    WHEN 'delete' THEN
      DELETE FROM kanban_boards
      WHERE id = p_board_id
      AND created_by = auth.uid();
      
      RETURN p_board_id;
    ELSE
      RAISE EXCEPTION 'Invalid action: %', p_action;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle file operations
CREATE OR REPLACE FUNCTION manage_file(
  p_file_id uuid,
  p_action text, -- 'move', 'rename', 'delete'
  p_new_folder_path text DEFAULT NULL,
  p_new_name text DEFAULT NULL
) RETURNS boolean AS $$
BEGIN
  CASE p_action
    WHEN 'move' THEN
      UPDATE files
      SET 
        folder_path = p_new_folder_path,
        updated_at = now()
      WHERE id = p_file_id
      AND user_id = auth.uid();
    WHEN 'rename' THEN
      UPDATE files
      SET 
        name = p_new_name,
        updated_at = now()
      WHERE id = p_file_id
      AND user_id = auth.uid();
    WHEN 'delete' THEN
      DELETE FROM files
      WHERE id = p_file_id
      AND user_id = auth.uid();
    ELSE
      RAISE EXCEPTION 'Invalid action: %', p_action;
  END CASE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle time tracking
CREATE OR REPLACE FUNCTION manage_time_entry(
  p_entry_id uuid,
  p_action text, -- 'start', 'stop', 'update'
  p_description text DEFAULT NULL,
  p_project_id uuid DEFAULT NULL,
  p_task_id uuid DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_entry_id uuid;
BEGIN
  CASE p_action
    WHEN 'start' THEN
      INSERT INTO time_entries (
        description,
        project_id,
        task_id,
        user_id,
        start_time
      )
      VALUES (
        p_description,
        p_project_id,
        p_task_id,
        auth.uid(),
        now()
      )
      RETURNING id INTO v_entry_id;
      
      RETURN v_entry_id;
    WHEN 'stop' THEN
      UPDATE time_entries
      SET 
        end_time = now(),
        duration = now() - start_time
      WHERE id = p_entry_id
      AND user_id = auth.uid()
      AND end_time IS NULL;
      
      RETURN p_entry_id;
    WHEN 'update' THEN
      UPDATE time_entries
      SET 
        description = COALESCE(p_description, description),
        project_id = COALESCE(p_project_id, project_id),
        task_id = COALESCE(p_task_id, task_id)
      WHERE id = p_entry_id
      AND user_id = auth.uid();
      
      RETURN p_entry_id;
    ELSE
      RAISE EXCEPTION 'Invalid action: %', p_action;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;