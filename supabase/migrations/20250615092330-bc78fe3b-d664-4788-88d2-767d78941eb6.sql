
-- Only create tables that don't exist yet
-- Check if takeback_items exists, if not create it
CREATE TABLE IF NOT EXISTS public.takeback_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  request_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  scheduled_date DATE,
  assessment_notes TEXT,
  recovery_value NUMERIC NOT NULL DEFAULT 0,
  carbon_saved NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on takeback_items if it was just created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'takeback_items' 
    AND policyname = 'Allow all operations on takeback_items'
  ) THEN
    ALTER TABLE public.takeback_items ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all operations on takeback_items" ON public.takeback_items FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_takeback_items_status ON public.takeback_items(status);

-- Make sure all tables have proper RLS policies
DO $$
BEGIN
  -- Manufacturing stages policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'manufacturing_stages' 
    AND policyname = 'Allow all operations on manufacturing_stages'
  ) THEN
    ALTER TABLE public.manufacturing_stages ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all operations on manufacturing_stages" ON public.manufacturing_stages FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Time entries policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_entries' 
    AND policyname = 'Allow all operations on time_entries'
  ) THEN
    ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all operations on time_entries" ON public.time_entries FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Energy records policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'energy_records' 
    AND policyname = 'Allow all operations on energy_records'
  ) THEN
    ALTER TABLE public.energy_records ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all operations on energy_records" ON public.energy_records FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
