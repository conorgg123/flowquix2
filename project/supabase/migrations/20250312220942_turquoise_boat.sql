/*
  # Add User Settings Table

  1. New Tables
    - `user_settings`
      - `user_id` (uuid, primary key, references auth.users)
      - `email_notifications` (boolean, default true)
      - `push_notifications` (boolean, default true)
      - `language` (text, default 'en')
      - `timezone` (text, default 'UTC')
      - `theme` (text, default 'system')
      - `two_factor_enabled` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `user_settings` table
    - Add policies for users to manage their own settings
    - Add trigger for updating timestamp
*/

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  theme text DEFAULT 'system',
  two_factor_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;

  -- Create new policies
  CREATE POLICY "Users can view their own settings"
    ON user_settings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can update their own settings"
    ON user_settings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own settings"
    ON user_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Create or replace function to update settings timestamp
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_settings_timestamp ON user_settings;
CREATE TRIGGER update_settings_timestamp
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_timestamp();