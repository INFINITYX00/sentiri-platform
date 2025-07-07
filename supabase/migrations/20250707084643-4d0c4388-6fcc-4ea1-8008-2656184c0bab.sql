
-- First, let's check if the column exists and add it if it doesn't
DO $$
BEGIN
    -- Check if carbon_factor column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' 
        AND column_name = 'carbon_factor'
        AND table_schema = 'public'
    ) THEN
        -- Add the carbon_factor column if it doesn't exist
        ALTER TABLE public.materials ADD COLUMN carbon_factor numeric;
    END IF;
END $$;

-- Also ensure we refresh the schema cache by updating the table's metadata
COMMENT ON COLUMN public.materials.carbon_factor IS 'Carbon factor in kg CO2 per kg of material';
