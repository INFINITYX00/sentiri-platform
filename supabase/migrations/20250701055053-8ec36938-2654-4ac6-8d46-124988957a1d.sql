
-- First, let's check and fix the RLS policies for proper company data isolation

-- Fix materials table policies
DROP POLICY IF EXISTS "Users can view company materials" ON public.materials;
DROP POLICY IF EXISTS "Users can insert company materials" ON public.materials;
DROP POLICY IF EXISTS "Users can update company materials" ON public.materials;
DROP POLICY IF EXISTS "Users can delete company materials" ON public.materials;

CREATE POLICY "Users can view company materials" ON public.materials
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company materials" ON public.materials
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company materials" ON public.materials
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company materials" ON public.materials
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Fix projects table policies
DROP POLICY IF EXISTS "Users can view company projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert company projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update company projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete company projects" ON public.projects;

CREATE POLICY "Users can view company projects" ON public.projects
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company projects" ON public.projects
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company projects" ON public.projects
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company projects" ON public.projects
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Fix product passports table policies
DROP POLICY IF EXISTS "Users can view company passports" ON public.product_passports;
DROP POLICY IF EXISTS "Users can insert company passports" ON public.product_passports;
DROP POLICY IF EXISTS "Users can update company passports" ON public.product_passports;
DROP POLICY IF EXISTS "Users can delete company passports" ON public.product_passports;

CREATE POLICY "Users can view company passports" ON public.product_passports
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company passports" ON public.product_passports
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company passports" ON public.product_passports
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company passports" ON public.product_passports
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Fix material passports table policies
DROP POLICY IF EXISTS "Users can view company material passports" ON public.material_passports;
DROP POLICY IF EXISTS "Users can insert company material passports" ON public.material_passports;
DROP POLICY IF EXISTS "Users can update company material passports" ON public.material_passports;
DROP POLICY IF EXISTS "Users can delete company material passports" ON public.material_passports;

CREATE POLICY "Users can view company material passports" ON public.material_passports
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company material passports" ON public.material_passports
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company material passports" ON public.material_passports
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company material passports" ON public.material_passports
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Fix BOMs table policies
DROP POLICY IF EXISTS "Users can view company BOMs" ON public.boms;
DROP POLICY IF EXISTS "Users can insert company BOMs" ON public.boms;
DROP POLICY IF EXISTS "Users can update company BOMs" ON public.boms;
DROP POLICY IF EXISTS "Users can delete company BOMs" ON public.boms;

CREATE POLICY "Users can view company BOMs" ON public.boms
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company BOMs" ON public.boms
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company BOMs" ON public.boms
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company BOMs" ON public.boms
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Add policies for other tables that were missing them
CREATE POLICY "Users can view company manufacturing stages" ON public.manufacturing_stages
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company manufacturing stages" ON public.manufacturing_stages
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company manufacturing stages" ON public.manufacturing_stages
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company manufacturing stages" ON public.manufacturing_stages
  FOR DELETE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can view company time entries" ON public.time_entries
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company time entries" ON public.time_entries
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company time entries" ON public.time_entries
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company time entries" ON public.time_entries
  FOR DELETE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can view company energy records" ON public.energy_records
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company energy records" ON public.energy_records
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company energy records" ON public.energy_records
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company energy records" ON public.energy_records
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Fix projects_materials table (this was missing RLS entirely)
ALTER TABLE public.projects_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company project materials" ON public.projects_materials
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE company_id = public.get_current_user_company_id()
    )
  );

CREATE POLICY "Users can insert company project materials" ON public.projects_materials
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE company_id = public.get_current_user_company_id()
    )
  );

CREATE POLICY "Users can update company project materials" ON public.projects_materials
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE company_id = public.get_current_user_company_id()
    )
  );

CREATE POLICY "Users can delete company project materials" ON public.projects_materials
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE company_id = public.get_current_user_company_id()
    )
  );
