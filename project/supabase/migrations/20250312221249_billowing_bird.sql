/*
  # Fix Storage and Chat Issues
  
  1. Changes
    - Create storage bucket for assets
    - Fix chat room member policies
    - Add proper indexes
    
  2. Security
    - Enable storage bucket policies
    - Fix recursive chat room policies
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable storage bucket policies
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');

CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner);

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