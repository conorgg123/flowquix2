/*
  # Fix Migrations and Add Remaining Features

  1. Changes
    - Drop existing conflicting policies
    - Create new tables for remaining features
    - Add proper RLS policies
    - Fix foreign key references

  2. Security
    - Enable RLS on all tables
    - Add appropriate access policies
    - Ensure proper data access control
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "team_invitations_manage" ON team_invitations;
DROP POLICY IF EXISTS "discord_tokens_manage_own" ON discord_tokens;
DROP POLICY IF EXISTS "discord_tokens_service_role" ON discord_tokens;

-- Create chat_rooms table if not exists
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_room_members table if not exists
CREATE TABLE IF NOT EXISTS chat_room_members (
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (room_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('member', 'admin'))
);

-- Create messages table if not exists
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create discord_tokens table if not exists
CREATE TABLE IF NOT EXISTS discord_tokens (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_id text NOT NULL,
  access_token text,
  refresh_token text,
  expires_at timestamp without time zone,
  PRIMARY KEY (user_id, discord_id),
  CONSTRAINT discord_tokens_discord_id_key UNIQUE (discord_id)
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_tokens ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS chat_rooms_created_by_idx ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS messages_room_id_idx ON messages(room_id);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS discord_tokens_user_id_idx ON discord_tokens(user_id);

-- Create policies for chat rooms
CREATE POLICY "chat_rooms_view_members"
ON chat_rooms
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = chat_rooms.id
    AND chat_room_members.user_id = auth.uid()
  )
  OR created_by = auth.uid()
);

CREATE POLICY "chat_rooms_manage_own"
ON chat_rooms
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Create policies for chat room members
CREATE POLICY "chat_room_members_view"
ON chat_room_members
FOR SELECT
TO authenticated
USING (
  room_id IN (
    SELECT room_id 
    FROM chat_room_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "chat_room_members_manage_admin"
ON chat_room_members
FOR ALL
TO authenticated
USING (
  room_id IN (
    SELECT room_id 
    FROM chat_room_members 
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create policies for messages
CREATE POLICY "messages_view_room"
ON messages
FOR SELECT
TO authenticated
USING (
  room_id IN (
    SELECT room_id 
    FROM chat_room_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "messages_manage_own"
ON messages
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create policies for discord tokens
CREATE POLICY "discord_tokens_manage_own"
ON discord_tokens
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create function to handle chat room creation
CREATE OR REPLACE FUNCTION create_chat_room(
  p_name text,
  p_description text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_room_id uuid;
BEGIN
  -- Create the room
  INSERT INTO chat_rooms (name, description, created_by)
  VALUES (p_name, p_description, auth.uid())
  RETURNING id INTO v_room_id;
  
  -- Add creator as admin
  INSERT INTO chat_room_members (room_id, user_id, role)
  VALUES (v_room_id, auth.uid(), 'admin');
  
  RETURN v_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle room member management
CREATE OR REPLACE FUNCTION manage_room_member(
  p_room_id uuid,
  p_user_id uuid,
  p_action text, -- 'add' or 'remove'
  p_role text DEFAULT 'member'
) RETURNS boolean AS $$
BEGIN
  -- Check if user is room admin
  IF NOT EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE room_id = p_room_id
    AND user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN false;
  END IF;

  IF p_action = 'add' THEN
    INSERT INTO chat_room_members (room_id, user_id, role)
    VALUES (p_room_id, p_user_id, p_role)
    ON CONFLICT (room_id, user_id) 
    DO UPDATE SET role = p_role;
  ELSIF p_action = 'remove' THEN
    DELETE FROM chat_room_members
    WHERE room_id = p_room_id AND user_id = p_user_id;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;