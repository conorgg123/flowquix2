/*
  # Add Digital Asset Management and Feedback Systems

  1. New Tables
    - assets: Stores digital assets metadata
    - asset_versions: Tracks asset version history
    - feedback_items: Stores feedback on assets
    - achievements: Stores user achievements

  2. Security
    - Enable RLS on all tables
    - Project members can view and manage assets
    - Users can manage their own feedback
    - Achievement data is read-only for users
*/

-- Create assets table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    tags text[] DEFAULT '{}',
    version integer DEFAULT 1,
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create asset_versions table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS asset_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
    version_number integer NOT NULL,
    url text NOT NULL,
    changes text,
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create feedback_items table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS feedback_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
    content text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'resolved'))
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create achievements table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    name text NOT NULL,
    description text,
    awarded_at timestamptz DEFAULT now(),
    CONSTRAINT valid_achievement_type CHECK (type IN ('task_completion', 'project_milestone', 'collaboration', 'feedback'))
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS assets_project_id_idx ON assets(project_id);
  CREATE INDEX IF NOT EXISTS assets_created_by_idx ON assets(created_by);
  CREATE INDEX IF NOT EXISTS asset_versions_asset_id_idx ON asset_versions(asset_id);
  CREATE INDEX IF NOT EXISTS feedback_items_asset_id_idx ON feedback_items(asset_id);
  CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON achievements(user_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "assets_view_project" ON assets;
DROP POLICY IF EXISTS "assets_manage_project" ON assets;
DROP POLICY IF EXISTS "asset_versions_view_project" ON asset_versions;
DROP POLICY IF EXISTS "asset_versions_manage_project" ON asset_versions;
DROP POLICY IF EXISTS "feedback_items_view_project" ON feedback_items;
DROP POLICY IF EXISTS "feedback_items_manage_own" ON feedback_items;
DROP POLICY IF EXISTS "achievements_view_own" ON achievements;

-- Create policies for assets
CREATE POLICY "assets_view_project"
ON assets
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id 
    FROM project_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "assets_manage_project"
ON assets
FOR ALL
TO authenticated
USING (
  project_id IN (
    SELECT project_id 
    FROM project_members 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT project_id 
    FROM project_members 
    WHERE user_id = auth.uid()
  )
);

-- Create policies for asset versions
CREATE POLICY "asset_versions_view_project"
ON asset_versions
FOR SELECT
TO authenticated
USING (
  asset_id IN (
    SELECT id 
    FROM assets 
    WHERE project_id IN (
      SELECT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "asset_versions_manage_project"
ON asset_versions
FOR ALL
TO authenticated
USING (
  asset_id IN (
    SELECT id 
    FROM assets 
    WHERE project_id IN (
      SELECT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  asset_id IN (
    SELECT id 
    FROM assets 
    WHERE project_id IN (
      SELECT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- Create policies for feedback items
CREATE POLICY "feedback_items_view_project"
ON feedback_items
FOR SELECT
TO authenticated
USING (
  asset_id IN (
    SELECT id 
    FROM assets 
    WHERE project_id IN (
      SELECT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "feedback_items_manage_own"
ON feedback_items
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Create policies for achievements
CREATE POLICY "achievements_view_own"
ON achievements
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create function to award achievements if it doesn't exist
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id uuid,
  p_type text,
  p_name text,
  p_description text
) RETURNS uuid AS $$
DECLARE
  v_achievement_id uuid;
BEGIN
  INSERT INTO achievements (user_id, type, name, description)
  VALUES (p_user_id, p_type, p_name, p_description)
  RETURNING id INTO v_achievement_id;
  
  RETURN v_achievement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;