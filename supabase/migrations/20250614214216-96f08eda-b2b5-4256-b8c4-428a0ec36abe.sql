
-- Add the missing carbon_source column to the materials table
ALTER TABLE public.materials 
ADD COLUMN carbon_source text;
