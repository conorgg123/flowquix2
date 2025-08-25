/*
  # Fix Storage Permissions and Configuration
  
  1. Changes
    - Configure storage bucket with proper permissions
    - Add policies for folder management
    - Ensure proper owner assignment
    
  2. Security
    - Enable proper RLS policies
    - Allow authenticated users to manage folders
*/

-- Ensure storage bucket exists and is configured correctly
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Create comprehensive storage policies
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
  AND (storage.foldername(name))[1] != ''
);

CREATE POLICY "Users can manage own files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'assets'
  AND owner = auth.uid()
);

-- Create extension for path manipulation if not exists
CREATE EXTENSION IF NOT EXISTS "ltree";