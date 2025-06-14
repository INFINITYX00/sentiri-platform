
-- Add quantity support and AI carbon data tracking to materials table
ALTER TABLE public.materials 
ADD COLUMN IF NOT EXISTS unit_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS ai_carbon_confidence numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ai_carbon_source text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ai_carbon_updated_at timestamp with time zone DEFAULT NULL;

-- Add AI tracking to material_types table
ALTER TABLE public.material_types 
ADD COLUMN IF NOT EXISTS ai_sourced boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS confidence_score numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_source text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_updated timestamp with time zone DEFAULT now();

-- Update the calculate_material_metrics function to handle unit counts
CREATE OR REPLACE FUNCTION public.calculate_material_metrics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
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
    
    -- Multiply by unit count for total volume
    IF NEW.unit_count IS NOT NULL AND NEW.unit_count > 0 THEN
      NEW.volume := NEW.volume * NEW.unit_count;
    END IF;
    
    -- Update quantity to total volume in mm³ for display consistency
    NEW.quantity := NEW.volume * 1000000000; -- m³ to mm³
    NEW.unit := 'mm³';
  END IF;
  
  -- Calculate weight if density is provided
  IF NEW.volume IS NOT NULL AND NEW.density IS NOT NULL THEN
    NEW.weight := NEW.volume * NEW.density; -- m³ * kg/m³ = kg
  END IF;
  
  -- Calculate total carbon footprint including unit count
  IF NEW.carbon_footprint IS NOT NULL AND NEW.unit_count IS NOT NULL AND NEW.unit_count > 0 THEN
    -- Carbon footprint is already calculated per unit in the application logic
    -- The trigger preserves the total carbon footprint calculated in the app
    NULL; -- No additional calculation needed here
  END IF;
  
  -- Update dimensions field for display
  IF NEW.length IS NOT NULL AND NEW.width IS NOT NULL AND NEW.thickness IS NOT NULL THEN
    IF NEW.unit_count IS NOT NULL AND NEW.unit_count > 1 THEN
      NEW.dimensions := NEW.unit_count || ' units × ' || NEW.length || NEW.dimension_unit || ' x ' || NEW.width || NEW.dimension_unit || ' x ' || NEW.thickness || NEW.dimension_unit;
    ELSE
      NEW.dimensions := NEW.length || NEW.dimension_unit || ' x ' || NEW.width || NEW.dimension_unit || ' x ' || NEW.thickness || NEW.dimension_unit;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
