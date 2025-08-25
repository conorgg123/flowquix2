/*
  # Add files table and storage configuration

  1. New Tables
    - `files`
      - `id` (uuid, primary key)
      - `name` (text)
      - `size` (integer)
      - `type` (text)
      - `url` (text)
      - `user_id` (uuid, references auth.users)
      - `project_id` (uuid, references projects)
      - `folder_path` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `files` table
    - Add policies for file management
      - Users can manage their own files
      - Users can view project files they have access to

  3. Storage Configuration
    - Create storage bucket for files
    - Configure storage policies
*/

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size integer NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  folder_path text DEFAULT '/',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS files_user_id_idx ON files(user_id);
CREATE INDEX IF NOT EXISTS files_project_id_idx ON files(project_id);
CREATE INDEX IF NOT EXISTS files_folder_path_idx ON files(folder_path);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "files_manage_own"
ON files
FOR ALL
TO public
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "files_view_project"
ON files
FOR SELECT
TO public
USING (
  user_id = auth.uid()
  OR (
    project_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = files.project_id
      AND project_members.user_id = auth.uid()
    )
  )
);

-- Create storage bucket
INSERT INTO storage.buckets (id, name)
VALUES ('files', 'files')
ON CONFLICT DO NOTHING;

-- Set up storage policies
CREATE POLICY "storage_manage_own"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'files' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'files' AND auth.uid() = owner);