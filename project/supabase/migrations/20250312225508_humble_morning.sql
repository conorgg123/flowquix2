/*
  # Enhance Kanban Board System

  1. Changes
    - Add custom column support
    - Add progress tracking
    - Add task filters
    - Add timeline data
    - Add AI suggestions

  2. Security
    - Maintain RLS policies
    - Ensure proper access control
*/

-- Add new columns to kanban_columns
ALTER TABLE kanban_columns
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS wip_limit integer,
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Add new columns to kanban_cards
ALTER TABLE kanban_cards
ADD COLUMN IF NOT EXISTS estimated_time interval,
ADD COLUMN IF NOT EXISTS actual_time interval,
ADD COLUMN IF NOT EXISTS start_date timestamptz,
ADD COLUMN IF NOT EXISTS completion_date timestamptz,
ADD COLUMN IF NOT EXISTS labels text[],
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_suggestions jsonb DEFAULT '{}';

-- Create kanban_column_templates table
CREATE TABLE IF NOT EXISTS kanban_column_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text,
  wip_limit integer,
  position integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create kanban_card_activity table
CREATE TABLE IF NOT EXISTS kanban_card_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  from_column_id uuid REFERENCES kanban_columns(id) ON DELETE SET NULL,
  to_column_id uuid REFERENCES kanban_columns(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE kanban_column_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_card_activity ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS kanban_card_activity_card_id_idx ON kanban_card_activity(card_id);
CREATE INDEX IF NOT EXISTS kanban_card_activity_user_id_idx ON kanban_card_activity(user_id);
CREATE INDEX IF NOT EXISTS kanban_card_activity_created_at_idx ON kanban_card_activity(created_at);

-- Create policies for kanban_column_templates
CREATE POLICY "Users can view column templates"
ON kanban_column_templates
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage their own templates"
ON kanban_column_templates
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Create policies for kanban_card_activity
CREATE POLICY "Users can view card activity"
ON kanban_card_activity
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kanban_cards
    JOIN kanban_columns ON kanban_columns.id = kanban_cards.column_id
    JOIN kanban_boards ON kanban_boards.id = kanban_columns.board_id
    JOIN workspace_members ON workspace_members.workspace_id = kanban_boards.workspace_id
    WHERE kanban_cards.id = kanban_card_activity.card_id
    AND workspace_members.user_id = auth.uid()
  )
);

-- Function to calculate column progress
CREATE OR REPLACE FUNCTION calculate_column_progress(p_column_id uuid)
RETURNS float AS $$
DECLARE
  v_total integer;
  v_completed integer;
BEGIN
  -- Get total cards
  SELECT COUNT(*) INTO v_total
  FROM kanban_cards
  WHERE column_id = p_column_id;

  -- Get completed cards (progress = 100)
  SELECT COUNT(*) INTO v_completed
  FROM kanban_cards
  WHERE column_id = p_column_id
  AND progress = 100;

  -- Return progress percentage
  RETURN CASE 
    WHEN v_total = 0 THEN 0
    ELSE (v_completed::float / v_total::float) * 100
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log card movement
CREATE OR REPLACE FUNCTION log_card_movement()
RETURNS trigger AS $$
BEGIN
  IF OLD.column_id IS DISTINCT FROM NEW.column_id THEN
    INSERT INTO kanban_card_activity (
      card_id,
      from_column_id,
      to_column_id,
      user_id,
      action,
      details
    ) VALUES (
      NEW.id,
      OLD.column_id,
      NEW.column_id,
      auth.uid(),
      'move',
      jsonb_build_object(
        'from_column', (SELECT name FROM kanban_columns WHERE id = OLD.column_id),
        'to_column', (SELECT name FROM kanban_columns WHERE id = NEW.column_id)
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for card movement
CREATE TRIGGER log_card_movement_trigger
AFTER UPDATE OF column_id ON kanban_cards
FOR EACH ROW
EXECUTE FUNCTION log_card_movement();

-- Function to check WIP limits
CREATE OR REPLACE FUNCTION check_wip_limit()
RETURNS trigger AS $$
DECLARE
  v_current_count integer;
  v_wip_limit integer;
BEGIN
  -- Get column's WIP limit
  SELECT wip_limit INTO v_wip_limit
  FROM kanban_columns
  WHERE id = NEW.column_id;

  -- If WIP limit is set
  IF v_wip_limit IS NOT NULL THEN
    -- Count current cards in column
    SELECT COUNT(*) INTO v_current_count
    FROM kanban_cards
    WHERE column_id = NEW.column_id;

    -- Check if move would exceed limit
    IF v_current_count >= v_wip_limit THEN
      RAISE EXCEPTION 'WIP limit reached for this column';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for WIP limit check
CREATE TRIGGER check_wip_limit_trigger
BEFORE INSERT OR UPDATE OF column_id ON kanban_cards
FOR EACH ROW
EXECUTE FUNCTION check_wip_limit();

-- Function to generate AI suggestions
CREATE OR REPLACE FUNCTION generate_card_suggestions(p_card_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_card kanban_cards;
  v_suggestions jsonb;
  v_avg_time interval;
  v_similar_cards integer;
BEGIN
  -- Get card details
  SELECT * INTO v_card
  FROM kanban_cards
  WHERE id = p_card_id;

  -- Calculate average completion time for similar cards
  SELECT 
    AVG(actual_time),
    COUNT(*)
  INTO v_avg_time, v_similar_cards
  FROM kanban_cards
  WHERE 
    labels && v_card.labels
    AND completion_date IS NOT NULL;

  -- Build suggestions
  v_suggestions := jsonb_build_object(
    'estimated_completion', CASE 
      WHEN v_avg_time IS NOT NULL THEN
        (now() + v_avg_time)::text
      ELSE
        null
    END,
    'similar_cards_count', v_similar_cards,
    'recommended_column', (
      SELECT name 
      FROM kanban_columns 
      WHERE id = v_card.column_id
    ),
    'confidence', CASE
      WHEN v_similar_cards > 10 THEN 'high'
      WHEN v_similar_cards > 5 THEN 'medium'
      ELSE 'low'
    END
  );

  RETURN v_suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;