/*
  # Fix Migration Issues

  1. Changes
    - Drop existing problematic policies
    - Create new comprehensive policies
    - Fix foreign key references
    - Add proper indexes
    - Enable proper RLS

  2. Security
    - Users can manage their own data
    - Service role has full access
    - Proper error handling
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "team_invitations_manage" ON team_invitations;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "discord_tokens_manage_own" ON discord_tokens;
DROP POLICY IF EXISTS "discord_tokens_service_role" ON discord_tokens;

-- Update discord_tokens foreign key
ALTER TABLE discord_tokens 
  DROP CONSTRAINT IF EXISTS discord_tokens_user_id_fkey,
  ADD CONSTRAINT discord_tokens_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Create comprehensive policies for discord_tokens
CREATE POLICY "discord_tokens_manage_own"
ON discord_tokens
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "discord_tokens_service_role"
ON discord_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for users
CREATE POLICY "users_view_own"
ON users
FOR SELECT
TO public
USING (auth.uid() = id);

CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO public
USING (auth.uid() = id);

CREATE POLICY "users_admin_all"
ON users
FOR ALL
TO service_role
USING (true);

-- Create policy for team invitations
CREATE POLICY "team_invitations_manage"
ON team_invitations
FOR ALL
TO authenticated
USING (
  project_id IN (
    SELECT project_id 
    FROM project_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  project_id IN (
    SELECT project_id 
    FROM project_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS discord_tokens_user_id_idx ON discord_tokens(user_id);
CREATE INDEX IF NOT EXISTS team_invitations_email_idx ON team_invitations(email);
CREATE INDEX IF NOT EXISTS team_invitations_status_idx ON team_invitations(status);