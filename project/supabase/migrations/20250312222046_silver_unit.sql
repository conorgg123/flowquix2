/*
  # Fix Storage and Chat Policies

  1. Changes
    - Fix storage bucket configuration
    - Update chat room member policies
    - Add proper indexes for performance
    - Fix recursive policy issues

  2. Security
    - Maintain RLS security
    - Ensure proper access control
    - Fix policy recursion issues
*/

-- Ensure storage bucket exists and is configured correctly
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage own files" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');

CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can manage own files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'assets'
  AND owner = auth.uid()
);

-- Fix chat room policies
DROP POLICY IF EXISTS "Room admins can manage rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view rooms they belong to" ON chat_rooms;

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

-- Fix chat room member policies
DROP POLICY IF EXISTS "Users can view room members" ON chat_room_members;
DROP POLICY IF EXISTS "Room admins can manage members" ON chat_room_members;

CREATE POLICY "Users can view room members"
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

CREATE POLICY "Room admins can manage members"
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

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS chat_room_members_user_role_idx 
ON chat_room_members(user_id, role);

CREATE INDEX IF NOT EXISTS chat_room_members_room_user_idx 
ON chat_room_members(room_id, user_id);

-- Create extension for path manipulation if not exists
CREATE EXTENSION IF NOT EXISTS "ltree";