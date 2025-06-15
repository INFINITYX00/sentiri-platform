
-- First, let's see what duplicates exist and clean them up more carefully
-- Delete duplicates keeping only the most recent one for each project_id + stage_id combination
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY project_id, stage_id ORDER BY created_at DESC) as rn
  FROM manufacturing_stages
)
DELETE FROM manufacturing_stages 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add the unique constraint to prevent future duplicates
ALTER TABLE manufacturing_stages 
ADD CONSTRAINT unique_project_stage 
UNIQUE (project_id, stage_id);
