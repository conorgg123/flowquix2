/*
  # Fix Storage and RLS Issues

  1. Changes
    - Create storage bucket with proper configuration
    - Fix RLS policies for files and storage
    - Update foreign key references
    - Add proper indexes

  2. Security
    - Enable public access to storage bucket
    - Allow authenticated users to manage their files
    - Fix policy conflicts
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
CREATE POLICY "storage_public_access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');

CREATE POLICY "storage_auth_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "storage_auth_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assets'
  AND owner = auth.uid()
);

CREATE POLICY "storage_auth_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'assets'
  AND owner = auth.uid()
);

-- Drop existing files policies to avoid conflicts
DROP POLICY IF EXISTS "files_manage_own" ON files;
DROP POLICY IF EXISTS "files_view_project" ON files;

-- Create files policies
CREATE POLICY "files_manage_own"
ON files
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "files_view_project"
ON files
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    project_id IS NOT NULL
    AND project_id IN (
      SELECT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS files_user_id_idx ON files(user_id);
CREATE INDEX IF NOT EXISTS files_project_id_idx ON files(project_id);
CREATE INDEX IF NOT EXISTS files_folder_path_idx ON files(folder_path);

-- Update foreign key references
ALTER TABLE files
  DROP CONSTRAINT IF EXISTS files_user_id_fkey,
  ADD CONSTRAINT files_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

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