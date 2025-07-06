-- Fix RLS policies to allow company and profile creation during signup
-- The issue is that get_current_user_company_id() returns NULL for new users

-- Drop existing problematic policies for companies
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
DROP POLICY IF EXISTS "Allow company creation during signup" ON public.companies;

-- Create new policies for companies that handle the signup case
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

-- Allow company creation during signup (no company_id check needed)
CREATE POLICY "Allow company creation during signup" ON public.companies
  FOR INSERT WITH CHECK (true);

-- Drop existing problematic policies for profiles
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Create new policies for profiles that handle the signup case
CREATE POLICY "Users can view profiles in their company" ON public.profiles
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Allow profile creation during signup (no company_id check needed)
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Update the get_current_user_company_id function to be more robust
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Add a comment explaining the signup flow
COMMENT ON FUNCTION public.get_current_user_company_id() IS 
'Returns the company_id for the current user. Returns NULL if user has no profile yet (during signup).'; 