/*
  # Add Discord Integration and Match History

  1. New Tables
    - discord_tokens: Store Discord OAuth tokens
      - user_id (uuid, references users)
      - discord_id (text)
      - access_token (text)
      - refresh_token (text)
      - expires_at (timestamp)
    
    - match_history: Store game match data
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - match_data (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access
    - Add admin policies
*/

-- Create discord_tokens table
CREATE TABLE IF NOT EXISTS discord_tokens (
  user_id uuid REFERENCES users(id),
  discord_id text NOT NULL,
  access_token text,
  refresh_token text,
  expires_at timestamp without time zone,
  PRIMARY KEY (user_id, discord_id),
  CONSTRAINT discord_tokens_discord_id_key UNIQUE (discord_id)
);

-- Create match_history table
CREATE TABLE IF NOT EXISTS match_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  match_data jsonb,
  created_at timestamp without time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE discord_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS discord_tokens_discord_id_key ON discord_tokens(discord_id);
CREATE INDEX IF NOT EXISTS match_history_pkey ON match_history(id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "discord_tokens_view_own" ON discord_tokens;
DROP POLICY IF EXISTS "discord_tokens_update_own" ON discord_tokens;
DROP POLICY IF EXISTS "discord_tokens_admin_all" ON discord_tokens;
DROP POLICY IF EXISTS "match_history_view_own" ON match_history;
DROP POLICY IF EXISTS "match_history_admin_all" ON match_history;

-- Create policies for discord_tokens
CREATE POLICY "discord_tokens_view_own_new"
ON discord_tokens
FOR SELECT
TO public
USING (auth.uid() = user_id);

CREATE POLICY "discord_tokens_update_own_new"
ON discord_tokens
FOR UPDATE
TO public
USING (auth.uid() = user_id);

CREATE POLICY "discord_tokens_admin_all_new"
ON discord_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for match_history
CREATE POLICY "match_history_view_own_new"
ON match_history
FOR SELECT
TO public
USING (auth.uid() = user_id);

CREATE POLICY "match_history_admin_all_new"
ON match_history
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);