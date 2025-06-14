
-- Add new columns to materials table to support volume-based tracking
ALTER TABLE materials 
ADD COLUMN length NUMERIC,
ADD COLUMN width NUMERIC,
ADD COLUMN thickness NUMERIC,
ADD COLUMN dimension_unit TEXT DEFAULT 'mm',
ADD COLUMN volume NUMERIC,
ADD COLUMN weight NUMERIC,
ADD COLUMN density NUMERIC,
ADD COLUMN specific_material TEXT;

-- Update the materials table to better reflect volume-based quantities
ALTER TABLE materials 
ALTER COLUMN unit SET DEFAULT 'mm³';

-- Create a material types lookup table for hierarchical material classification
CREATE TABLE public.material_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  specific_type TEXT NOT NULL,
  density NUMERIC, -- kg/m³ for automatic weight calculation
  carbon_factor NUMERIC DEFAULT 2.0, -- kg CO2 per unit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default material types based on your data
INSERT INTO public.material_types (category, specific_type, density, carbon_factor) VALUES
('Reclaimed_Wood', 'Reclaimed Pine Board', 500, 0.5),
('Reclaimed_Wood', 'Reclaimed Oak Board', 700, 0.6),
('Wood', 'Pine Board', 500, 0.8),
('Wood', 'Oak Board', 700, 1.0),
('Metal', 'Steel Sheet', 7850, 8.2),
('Metal', 'Aluminum Sheet', 2700, 11.5),
('Composite', 'Plywood', 600, 3.1),
('Plastic', 'HDPE Sheet', 950, 2.8);

-- Enable RLS on material_types
ALTER TABLE public.material_types ENABLE ROW LEVEL SECURITY;

-- Create policies for material_types (read-only for most operations)
CREATE POLICY "Anyone can view material types" ON public.material_types FOR SELECT USING (true);
CREATE POLICY "Anyone can insert material types" ON public.material_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update material types" ON public.material_types FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete material types" ON public.material_types FOR DELETE USING (true);

-- Create a function to automatically calculate volume and weight
CREATE OR REPLACE FUNCTION calculate_material_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate volume if dimensions are provided (convert to m³)
  IF NEW.length IS NOT NULL AND NEW.width IS NOT NULL AND NEW.thickness IS NOT NULL THEN
    CASE NEW.dimension_unit
      WHEN 'mm' THEN
        NEW.volume := (NEW.length * NEW.width * NEW.thickness) / 1000000000; -- mm³ to m³
      WHEN 'cm' THEN
        NEW.volume := (NEW.length * NEW.width * NEW.thickness) / 1000000; -- cm³ to m³
      WHEN 'm' THEN
        NEW.volume := NEW.length * NEW.width * NEW.thickness; -- already in m³
      ELSE
        NEW.volume := (NEW.length * NEW.width * NEW.thickness) / 1000000000; -- default to mm³ to m³
    END CASE;
    
    -- Update quantity to volume in mm³ for display consistency
    NEW.quantity := NEW.volume * 1000000000; -- m³ to mm³
    NEW.unit := 'mm³';
  END IF;
  
  -- Calculate weight if density is provided
  IF NEW.volume IS NOT NULL AND NEW.density IS NOT NULL THEN
    NEW.weight := NEW.volume * NEW.density; -- m³ * kg/m³ = kg
  END IF;
  
  -- Update dimensions field for display
  IF NEW.length IS NOT NULL AND NEW.width IS NOT NULL AND NEW.thickness IS NOT NULL THEN
    NEW.dimensions := NEW.length || NEW.dimension_unit || ' x ' || NEW.width || NEW.dimension_unit || ' x ' || NEW.thickness || NEW.dimension_unit;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate metrics
CREATE TRIGGER calculate_material_metrics_trigger
  BEFORE INSERT OR UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION calculate_material_metrics();
