-- Create document_states table for collaborative editing
CREATE TABLE IF NOT EXISTS document_states (
  document_id uuid PRIMARY KEY,
  state bytea NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE document_states ENABLE ROW LEVEL SECURITY;

-- Create policies for document states
CREATE POLICY "Users can view document states"
ON document_states
FOR SELECT
TO authenticated
USING (
  document_id IN (
    SELECT id FROM files WHERE user_id = auth.uid()
    UNION
    SELECT id FROM files 
    WHERE project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update document states"
ON document_states
FOR ALL
TO authenticated
USING (
  document_id IN (
    SELECT id FROM files WHERE user_id = auth.uid()
    UNION
    SELECT id FROM files 
    WHERE project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  document_id IN (
    SELECT id FROM files WHERE user_id = auth.uid()
    UNION
    SELECT id FROM files 
    WHERE project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
);

-- Create function to handle document state updates
CREATE OR REPLACE FUNCTION merge_document_states(
  p_document_id uuid,
  p_state bytea
) RETURNS void AS $$
DECLARE
  v_current_state bytea;
BEGIN
  -- Get current state
  SELECT state INTO v_current_state
  FROM document_states
  WHERE document_id = p_document_id;

  IF v_current_state IS NULL THEN
    -- Insert new state
    INSERT INTO document_states (document_id, state)
    VALUES (p_document_id, p_state);
  ELSE
    -- Update existing state
    UPDATE document_states
    SET 
      state = p_state,
      updated_at = now()
    WHERE document_id = p_document_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;