
-- 1. Ensure 'projects' table has all editing/deletion mechanics (no SQL change needed, handled at application level).
-- 2. Ensure 'manufacturing_stages' supports robust updates.
-- 3. Clean up status values to enforce 'pending', 'in_progress', 'completed', 'blocked'.

-- (Optional, add enum for robust stage status, but not mandatory for now.)

-- 4. Add indices for quick lookup.
CREATE INDEX IF NOT EXISTS idx_manufacturing_stages_project_id ON manufacturing_stages(project_id);

-- 5. (Optional) Add 'deleted' column for soft deletion, if hard delete is not desired.
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS deleted boolean NOT NULL DEFAULT FALSE;

-- 6. (Optional) Add 'updated_at' for projects if not present (already exists).

-- 7. Make sure 'workers' ARRAY field in manufacturing_stages works for assignment (already exists).

-- 8. Add a trigger for 'updated_at' timestamp for projects edits.
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_projects_updated_at ON projects;

CREATE TRIGGER trg_update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_projects_updated_at();

