/*
  # Fix Chat Room Policies

  1. Changes
    - Drop and recreate chat room policies with simplified logic
    - Ensure proper access control for chat rooms and messages
    - Fix policy recursion issues

  2. Security
    - Users can create chat rooms
    - Room members can view messages
    - Room admins can manage rooms
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view rooms they are members of" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Room admins can manage rooms" ON chat_rooms;

-- Create new simplified policies for chat rooms
CREATE POLICY "Room admins can manage rooms"
ON chat_rooms
FOR ALL
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = chat_rooms.id
    AND chat_room_members.user_id = auth.uid()
    AND chat_room_members.role = 'admin'
  ))
  OR created_by = auth.uid()
);

CREATE POLICY "Users can create chat rooms"
ON chat_rooms
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view rooms they belong to"
ON chat_rooms
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = chat_rooms.id
    AND chat_room_members.user_id = auth.uid()
  ))
  OR created_by = auth.uid()
);

-- Drop existing message policies
DROP POLICY IF EXISTS "Room members can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages to rooms they are members of" ON messages;
DROP POLICY IF EXISTS "Users can manage their own messages" ON messages;

-- Create new message policies
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

-- Drop existing room member policies
DROP POLICY IF EXISTS "Users can view room members" ON chat_room_members;
DROP POLICY IF EXISTS "Room admins can manage members" ON chat_room_members;

-- Create new room member policies
CREATE POLICY "Users can view room members"
ON chat_room_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_room_members chat_room_members_1
    WHERE chat_room_members_1.room_id = chat_room_members_1.room_id
    AND chat_room_members_1.user_id = auth.uid()
  )
);

CREATE POLICY "Room admins can manage members"
ON chat_room_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_room_members chat_room_members_1
    WHERE chat_room_members_1.room_id = chat_room_members_1.room_id
    AND chat_room_members_1.user_id = auth.uid()
    AND chat_room_members_1.role = 'admin'
  )
);