
-- Update the calculate_material_metrics function to preserve original units
CREATE OR REPLACE FUNCTION public.calculate_material_metrics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only calculate volume and convert units if user selected a volume unit
  IF NEW.unit IN ('m³', 'cm³', 'mm³') AND NEW.length IS NOT NULL AND NEW.width IS NOT NULL AND NEW.thickness IS NOT NULL THEN
    -- Calculate volume if dimensions are provided (convert to m³)
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
    
    -- Update quantity to total volume in the selected volume unit
    CASE NEW.unit
      WHEN 'm³' THEN
        NEW.quantity := NEW.volume;
      WHEN 'cm³' THEN
        NEW.quantity := NEW.volume * 1000000; -- m³ to cm³
      WHEN 'mm³' THEN
        NEW.quantity := NEW.volume * 1000000000; -- m³ to mm³
    END CASE;
  ELSE
    -- For non-volume units, preserve the original quantity and unit
    -- Still calculate volume for reference if dimensions are provided
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
      
      -- Multiply by unit count for total volume (for reference only)
      IF NEW.unit_count IS NOT NULL AND NEW.unit_count > 0 THEN
        NEW.volume := NEW.volume * NEW.unit_count;
      END IF;
    END IF;
    
    -- Keep original quantity and unit as entered by user
    -- NEW.quantity and NEW.unit remain unchanged
  END IF;
  
  -- Calculate weight if density is provided
  IF NEW.volume IS NOT NULL AND NEW.density IS NOT NULL THEN
    NEW.weight := NEW.volume * NEW.density; -- m³ * kg/m³ = kg
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
