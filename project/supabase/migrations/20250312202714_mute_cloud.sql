/*
  # Fix Calendar Events Policies

  1. Changes
    - Drop existing policies that cause recursion
    - Create new, simplified policies for calendar events
    - Enable RLS on calendar_events table
    
  2. Security
    - Users can manage their own calendar events
    - Users can view events for projects they are members of
    - No recursive policy checks
*/

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view project calendar events" ON calendar_events;

-- Create new policies
CREATE POLICY "Users can manage their own events"
ON calendar_events
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- For project events, allow view access to project members
CREATE POLICY "View project events"
ON calendar_events
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR (
    project_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = calendar_events.project_id 
      AND project_members.user_id = auth.uid()
    )
  )
);