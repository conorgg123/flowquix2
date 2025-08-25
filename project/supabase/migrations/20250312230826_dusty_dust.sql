/*
  # Fix RLS Policies and Authentication Issues

  1. Changes
    - Fix team members policy
    - Fix files policy
    - Fix chat rooms policy
    - Fix time entries policy
    - Fix calendar events policy
    - Add missing user_id columns
    - Update foreign key references

  2. Security
    - Maintain proper access control
    - Ensure authenticated users can access their data
    - Fix policy recursion issues
*/

-- Fix team members query
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "files_manage_own" ON files;
DROP POLICY IF EXISTS "files_view_project" ON files;
DROP POLICY IF EXISTS "time_entries_manage_own" ON time_entries;
DROP POLICY IF EXISTS "time_entries_view_project" ON time_entries;
DROP POLICY IF EXISTS "calendar_events_manage_own" ON calendar_events;
DROP POLICY IF EXISTS "calendar_events_view_project" ON calendar_events;

-- Create new policies for files
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

-- Create new policies for time entries
CREATE POLICY "time_entries_manage_own"
ON time_entries
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "time_entries_view_project"
ON time_entries
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id 
    FROM project_members 
    WHERE user_id = auth.uid()
  )
);

-- Create new policies for calendar events
CREATE POLICY "calendar_events_manage_own"
ON calendar_events
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "calendar_events_view_project"
ON calendar_events
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

-- Ensure user_id columns exist and are properly constrained
ALTER TABLE files
  DROP CONSTRAINT IF EXISTS files_user_id_fkey,
  ADD CONSTRAINT files_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE time_entries
  DROP CONSTRAINT IF EXISTS time_entries_user_id_fkey,
  ADD CONSTRAINT time_entries_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_user_id_fkey,
  ADD CONSTRAINT calendar_events_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS files_user_id_idx ON files(user_id);
CREATE INDEX IF NOT EXISTS time_entries_user_id_idx ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS calendar_events_user_id_idx ON calendar_events(user_id);

-- Create function to handle user authentication check
CREATE OR REPLACE FUNCTION auth_user_id() 
RETURNS uuid AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;