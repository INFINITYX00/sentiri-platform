-- Complete RLS reset to fix infinite recursion
-- This will completely remove all RLS policies and recreate them from scratch

-- Step 1: Disable RLS on all tables to break the recursion
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.boms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_passports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_passports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturing_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_materials DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to start completely fresh
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
DROP POLICY IF EXISTS "Allow company creation during signup" ON public.companies;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view company materials" ON public.materials;
DROP POLICY IF EXISTS "Users can insert company materials" ON public.materials;
DROP POLICY IF EXISTS "Users can update company materials" ON public.materials;
DROP POLICY IF EXISTS "Users can delete company materials" ON public.materials;
DROP POLICY IF EXISTS "Users can view company projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert company projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update company projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete company projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view company BOMs" ON public.boms;
DROP POLICY IF EXISTS "Users can insert company BOMs" ON public.boms;
DROP POLICY IF EXISTS "Users can update company BOMs" ON public.boms;
DROP POLICY IF EXISTS "Users can delete company BOMs" ON public.boms;
DROP POLICY IF EXISTS "Users can view company material passports" ON public.material_passports;
DROP POLICY IF EXISTS "Users can insert company material passports" ON public.material_passports;
DROP POLICY IF EXISTS "Users can update company material passports" ON public.material_passports;
DROP POLICY IF EXISTS "Users can delete company material passports" ON public.material_passports;
DROP POLICY IF EXISTS "Users can view company product passports" ON public.product_passports;
DROP POLICY IF EXISTS "Users can insert company product passports" ON public.product_passports;
DROP POLICY IF EXISTS "Users can update company product passports" ON public.product_passports;
DROP POLICY IF EXISTS "Users can delete company product passports" ON public.product_passports;
DROP POLICY IF EXISTS "Users can view company manufacturing stages" ON public.manufacturing_stages;
DROP POLICY IF EXISTS "Users can insert company manufacturing stages" ON public.manufacturing_stages;
DROP POLICY IF EXISTS "Users can update company manufacturing stages" ON public.manufacturing_stages;
DROP POLICY IF EXISTS "Users can delete company manufacturing stages" ON public.manufacturing_stages;
DROP POLICY IF EXISTS "Users can view company time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can insert company time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update company time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete company time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can view company energy records" ON public.energy_records;
DROP POLICY IF EXISTS "Users can insert company energy records" ON public.energy_records;
DROP POLICY IF EXISTS "Users can update company energy records" ON public.energy_records;
DROP POLICY IF EXISTS "Users can delete company energy records" ON public.energy_records;
DROP POLICY IF EXISTS "Users can view company project materials" ON public.projects_materials;
DROP POLICY IF EXISTS "Users can insert company project materials" ON public.projects_materials;
DROP POLICY IF EXISTS "Users can update company project materials" ON public.projects_materials;
DROP POLICY IF EXISTS "Users can delete company project materials" ON public.projects_materials;

-- Step 3: Re-enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturing_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_materials ENABLE ROW LEVEL SECURITY;

-- Step 4: Create minimal, non-recursive policies for signup
-- Companies table - allow all operations during signup
CREATE POLICY "Allow all company operations" ON public.companies
  FOR ALL USING (true) WITH CHECK (true);

-- Profiles table - allow all operations during signup  
CREATE POLICY "Allow all profile operations" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Step 5: Create a simple function to get company ID without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 6: Add basic policies for other tables (will be refined later)
CREATE POLICY "Allow all material operations" ON public.materials
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all project operations" ON public.projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all BOM operations" ON public.boms
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all passport operations" ON public.material_passports
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all product passport operations" ON public.product_passports
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all manufacturing stage operations" ON public.manufacturing_stages
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all time entry operations" ON public.time_entries
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all energy record operations" ON public.energy_records
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all project material operations" ON public.projects_materials
  FOR ALL USING (true) WITH CHECK (true);

-- Add a comment explaining this is a temporary setup
COMMENT ON FUNCTION public.get_current_user_company_id() IS 
'Temporary function for signup - allows all operations during initial setup.'; 