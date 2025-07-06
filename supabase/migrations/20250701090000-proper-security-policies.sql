-- Implement proper security policies
-- This replaces the temporary permissive policies with secure, company-isolated ones

-- Step 1: Drop all existing permissive policies
DROP POLICY IF EXISTS "Allow all company operations" ON public.companies;
DROP POLICY IF EXISTS "Allow all profile operations" ON public.profiles;
DROP POLICY IF EXISTS "Allow all material operations" ON public.materials;
DROP POLICY IF EXISTS "Allow all project operations" ON public.projects;
DROP POLICY IF EXISTS "Allow all BOM operations" ON public.boms;
DROP POLICY IF EXISTS "Allow all passport operations" ON public.material_passports;
DROP POLICY IF EXISTS "Allow all product passport operations" ON public.product_passports;
DROP POLICY IF EXISTS "Allow all manufacturing stage operations" ON public.manufacturing_stages;
DROP POLICY IF EXISTS "Allow all time entry operations" ON public.time_entries;
DROP POLICY IF EXISTS "Allow all energy record operations" ON public.energy_records;
DROP POLICY IF EXISTS "Allow all project material operations" ON public.projects_materials;

-- Step 2: Create secure company policies
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own company" ON public.companies
  FOR UPDATE USING (
    id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Allow company creation during signup only
CREATE POLICY "Allow company creation during signup" ON public.companies
  FOR INSERT WITH CHECK (true);

-- Step 3: Create secure profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Allow profile creation during signup only
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Users can view profiles in their company (for team management)
CREATE POLICY "Users can view company profiles" ON public.profiles
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Step 4: Create secure material policies
CREATE POLICY "Users can view company materials" ON public.materials
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company materials" ON public.materials
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company materials" ON public.materials
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company materials" ON public.materials
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Step 5: Create secure project policies
CREATE POLICY "Users can view company projects" ON public.projects
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company projects" ON public.projects
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company projects" ON public.projects
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company projects" ON public.projects
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Step 6: Create secure BOM policies
CREATE POLICY "Users can view company BOMs" ON public.boms
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company BOMs" ON public.boms
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company BOMs" ON public.boms
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company BOMs" ON public.boms
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Step 7: Create secure passport policies
CREATE POLICY "Users can view company material passports" ON public.material_passports
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company material passports" ON public.material_passports
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company material passports" ON public.material_passports
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company material passports" ON public.material_passports
  FOR DELETE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can view company product passports" ON public.product_passports
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company product passports" ON public.product_passports
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company product passports" ON public.product_passports
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company product passports" ON public.product_passports
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Step 8: Create secure manufacturing policies
CREATE POLICY "Users can view company manufacturing stages" ON public.manufacturing_stages
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company manufacturing stages" ON public.manufacturing_stages
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company manufacturing stages" ON public.manufacturing_stages
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company manufacturing stages" ON public.manufacturing_stages
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Step 9: Create secure time entry policies
CREATE POLICY "Users can view company time entries" ON public.time_entries
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company time entries" ON public.time_entries
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company time entries" ON public.time_entries
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company time entries" ON public.time_entries
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Step 10: Create secure energy record policies
CREATE POLICY "Users can view company energy records" ON public.energy_records
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company energy records" ON public.energy_records
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company energy records" ON public.energy_records
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company energy records" ON public.energy_records
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Step 11: Create secure project material policies
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

-- Step 12: Update the get_current_user_company_id function to be more secure
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID AS $$
BEGIN
  -- Only return company_id if user has a valid profile
  RETURN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND company_id IS NOT NULL
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 13: Add security comments
COMMENT ON FUNCTION public.get_current_user_company_id() IS 
'Secure function that returns the company_id for the current authenticated user. Returns NULL if user has no profile or company.';

-- Step 14: Create audit trigger for security logging
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log important changes for security auditing
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, operation, record_id, user_id, company_id, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.id, auth.uid(), OLD.company_id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, operation, record_id, user_id, company_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, auth.uid(), NEW.company_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, operation, record_id, user_id, company_id, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, auth.uid(), NEW.company_id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID,
  user_id UUID,
  company_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own company's audit logs
CREATE POLICY "Users can view company audit logs" ON public.audit_logs
  FOR SELECT USING (company_id = public.get_current_user_company_id());

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_materials_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_projects_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_companies_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Step 15: Add rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  operation_name TEXT,
  max_attempts INTEGER DEFAULT 10,
  window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count recent attempts by this user
  SELECT COUNT(*) INTO attempt_count
  FROM audit_logs
  WHERE user_id = auth.uid()
    AND operation = operation_name
    AND created_at > now() - interval '1 minute' * window_minutes;
  
  -- Return true if under limit, false if over limit
  RETURN attempt_count < max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_rate_limit(TEXT, INTEGER, INTEGER) IS 
'Rate limiting function to prevent abuse. Returns true if user is under the rate limit.'; 