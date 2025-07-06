-- Fix infinite recursion in RLS policies
-- The issue is that policies are referencing each other in a circular way

-- First, disable RLS temporarily to clean up
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
DROP POLICY IF EXISTS "Allow company creation during signup" ON public.companies;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Re-enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for companies
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

-- Allow company creation during signup (no restrictions)
CREATE POLICY "Allow company creation during signup" ON public.companies
  FOR INSERT WITH CHECK (true);

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Allow profile creation during signup (no restrictions)
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Create a separate policy for viewing profiles in the same company (only after profile exists)
CREATE POLICY "Users can view company profiles" ON public.profiles
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Update the get_current_user_company_id function to be more robust
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Add a comment explaining the signup flow
COMMENT ON FUNCTION public.get_current_user_company_id() IS 
'Returns the company_id for the current user. Returns NULL if user has no profile yet (during signup).'; 