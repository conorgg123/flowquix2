-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text DEFAULT 'offline';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  CONSTRAINT valid_role CHECK (role IN ('member', 'admin')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS team_invitations_email_idx ON team_invitations(email);
CREATE INDEX IF NOT EXISTS team_invitations_status_idx ON team_invitations(status);

-- Enable RLS
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Function to handle team invitations
CREATE OR REPLACE FUNCTION handle_team_invitation(
  p_invitation_id uuid,
  p_action text -- 'accept' or 'cancel'
) RETURNS boolean AS $$
DECLARE
  v_invitation team_invitations;
BEGIN
  -- Get invitation
  SELECT * INTO v_invitation
  FROM team_invitations
  WHERE id = p_invitation_id
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF p_action = 'accept' THEN
    -- Add user to project members
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (v_invitation.project_id, auth.uid(), v_invitation.role);
    
    -- Update invitation status
    UPDATE team_invitations
    SET status = 'accepted'
    WHERE id = p_invitation_id;
  ELSIF p_action = 'cancel' THEN
    -- Update invitation status
    UPDATE team_invitations
    SET status = 'cancelled'
    WHERE id = p_invitation_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user status
CREATE OR REPLACE FUNCTION update_user_status(
  p_status text
) RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    status = p_status,
    last_active = now()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;