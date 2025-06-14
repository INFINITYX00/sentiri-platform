
-- Add the missing cost_per_unit column to the materials table
ALTER TABLE public.materials 
ADD COLUMN IF NOT EXISTS cost_per_unit numeric DEFAULT NULL;
