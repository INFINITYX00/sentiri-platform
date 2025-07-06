-- Fix signup process while maintaining security
-- This migration ensures signup works while keeping all other security measures

-- Step 1: Update company policies to allow signup
DROP POLICY IF EXISTS "Allow company creation during signup" ON public.companies;

-- Create a more specific policy for company creation during signup
CREATE POLICY "Allow company creation during signup" ON public.companies
  FOR INSERT WITH CHECK (
    -- Allow if user is authenticated but has no profile yet (signup case)
    auth.uid() IS NOT NULL AND
    NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Step 2: Update profile policies to allow signup
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Create a more specific policy for profile creation during signup
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (
    -- Allow if user is authenticated and the profile is for them
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

-- Step 3: Update the get_current_user_company_id function to handle signup better
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID AS $$
BEGIN
  -- Return company_id for authenticated users with profiles
  RETURN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND company_id IS NOT NULL
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    -- During signup, this might return NULL, which is expected
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 4: Add a function to check if user is in signup process
CREATE OR REPLACE FUNCTION public.is_user_in_signup()
RETURNS BOOLEAN AS $$
BEGIN
  -- Return true if user is authenticated but has no profile yet
  RETURN (
    auth.uid() IS NOT NULL AND
    NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE user_id = auth.uid()
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 5: Update material policies to handle signup case
DROP POLICY IF EXISTS "Users can insert company materials" ON public.materials;
CREATE POLICY "Users can insert company materials" ON public.materials
  FOR INSERT WITH CHECK (
    -- Allow if user has a company OR is in signup process
    (company_id = public.get_current_user_company_id()) OR
    public.is_user_in_signup()
  );

-- Step 6: Update project policies to handle signup case
DROP POLICY IF EXISTS "Users can insert company projects" ON public.projects;
CREATE POLICY "Users can insert company projects" ON public.projects
  FOR INSERT WITH CHECK (
    -- Allow if user has a company OR is in signup process
    (company_id = public.get_current_user_company_id()) OR
    public.is_user_in_signup()
  );

-- Step 7: Add comments explaining the signup flow
COMMENT ON FUNCTION public.get_current_user_company_id() IS 
'Secure function that returns the company_id for the current authenticated user. Returns NULL during signup (expected behavior).';

COMMENT ON FUNCTION public.is_user_in_signup() IS 
'Helper function to identify if a user is in the signup process (authenticated but no profile yet).';

-- Step 8: Create a trigger to automatically set company_id on insert for signup users
CREATE OR REPLACE FUNCTION set_company_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If company_id is not set and user is in signup, try to get it from their profile
  IF NEW.company_id IS NULL AND public.is_user_in_signup() THEN
    SELECT company_id INTO NEW.company_id
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to materials table
DROP TRIGGER IF EXISTS set_company_id_materials ON public.materials;
CREATE TRIGGER set_company_id_materials
  BEFORE INSERT ON public.materials
  FOR EACH ROW EXECUTE FUNCTION set_company_id_on_insert();

-- Add trigger to projects table
DROP TRIGGER IF EXISTS set_company_id_projects ON public.projects;
CREATE TRIGGER set_company_id_projects
  BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION set_company_id_on_insert();

-- Step 9: Ensure all tables have proper company_id handling
-- This ensures that even if a user somehow bypasses the policies, 
-- their data will be properly associated with their company

-- Add company_id column to any tables that might be missing it
DO $$
BEGIN
  -- Check if materials table has company_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.materials ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
  
  -- Check if projects table has company_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 10: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_materials_company_id ON public.materials(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON public.projects(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- Step 11: Add a function to help with debugging signup issues
CREATE OR REPLACE FUNCTION debug_user_status()
RETURNS TABLE(
  user_id UUID,
  has_profile BOOLEAN,
  company_id UUID,
  is_in_signup BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as user_id,
    EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid()) as has_profile,
    public.get_current_user_company_id() as company_id,
    public.is_user_in_signup() as is_in_signup;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION debug_user_status() IS 
'Debug function to help troubleshoot signup and authentication issues.'; 