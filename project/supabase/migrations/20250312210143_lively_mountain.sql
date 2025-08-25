/*
  # Chat System Schema

  1. New Tables
    - `chat_rooms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_room_members`
      - `room_id` (uuid, references chat_rooms)
      - `user_id` (uuid, references auth.users)
      - `role` (text)
      - `joined_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `user_id` (uuid, references auth.users)
      - `room_id` (uuid, references chat_rooms)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for chat room access and message management
*/

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_room_members table
CREATE TABLE IF NOT EXISTS chat_room_members (
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (room_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('member', 'admin'))
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS chat_rooms_created_by_idx ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS messages_room_id_idx ON messages(room_id);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Chat room policies
CREATE POLICY "Users can view rooms they are members of"
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

CREATE POLICY "Users can create chat rooms"
ON chat_rooms
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room admins can manage rooms"
ON chat_rooms
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = chat_rooms.id
    AND chat_room_members.user_id = auth.uid()
    AND chat_room_members.role = 'admin'
  )
  OR created_by = auth.uid()
);

-- Chat room member policies
CREATE POLICY "Users can view room members"
ON chat_room_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = chat_room_members.room_id
    AND chat_room_members.user_id = auth.uid()
  )
);

CREATE POLICY "Room admins can manage members"
ON chat_room_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = chat_room_members.room_id
    AND chat_room_members.user_id = auth.uid()
    AND chat_room_members.role = 'admin'
  )
);

-- Message policies
CREATE POLICY "Room members can view messages"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = messages.room_id
    AND chat_room_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to rooms they are members of"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = messages.room_id
    AND chat_room_members.user_id = auth.uid()
  )
  AND auth.uid() = user_id
);

CREATE POLICY "Users can manage their own messages"
ON messages
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);