
-- Enable real-time for the materials table
ALTER TABLE public.materials REPLICA IDENTITY FULL;

-- Add the materials table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.materials;
