/*
  # Fix Discord Integration Policies

  1. Changes
    - Add INSERT policy for discord_tokens
    - Fix RLS policies for better access control
    - Ensure proper user authentication checks

  2. Security
    - Users can manage their own tokens
    - Service role has full access
    - Proper error handling
*/

-- Drop existing policies
DROP POLICY IF EXISTS "discord_tokens_view_own_new" ON discord_tokens;
DROP POLICY IF EXISTS "discord_tokens_update_own_new" ON discord_tokens;
DROP POLICY IF EXISTS "discord_tokens_admin_all_new" ON discord_tokens;

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

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS discord_tokens_user_id_idx ON discord_tokens(user_id);

-- Update foreign key to auth.users
ALTER TABLE discord_tokens 
  DROP CONSTRAINT IF EXISTS discord_tokens_user_id_fkey,
  ADD CONSTRAINT discord_tokens_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;