/*
  # Add notifications system

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text)
      - `type` (text: info, success, warning, error)
      - `read` (boolean)
      - `action_url` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on notifications table
    - Add policy for users to manage their own notifications
*/

-- Create notifications table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    type text NOT NULL,
    read boolean DEFAULT false,
    action_url text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT valid_type CHECK (type IN ('info', 'success', 'warning', 'error'))
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own notifications" ON notifications;

-- Create policy for users to manage their own notifications
CREATE POLICY "Users can manage their own notifications"
ON notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_content text,
  p_type text DEFAULT 'info',
  p_action_url text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, content, type, action_url)
  VALUES (p_user_id, p_title, p_content, p_type, p_action_url)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;