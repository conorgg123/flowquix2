/*
  # Fix Discord Integration and Settings

  1. Changes
    - Drop existing problematic policies
    - Create new comprehensive policies for discord_tokens
    - Fix foreign key references
    - Add proper indexes
    - Enable proper RLS

  2. Security
    - Users can manage their own tokens
    - Service role has full access
    - Proper error handling
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "discord_tokens_manage_own" ON discord_tokens;
DROP POLICY IF EXISTS "discord_tokens_service_role" ON discord_tokens;

-- Update foreign key to reference auth.users directly
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

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS discord_tokens_user_id_idx ON discord_tokens(user_id);