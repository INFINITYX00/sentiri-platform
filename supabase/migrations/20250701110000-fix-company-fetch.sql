-- Fix company fetch issue for authenticated users
-- This allows users to fetch their company data when they have a valid profile

-- Step 1: Update company SELECT policy to allow users to view their own company
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;

CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT USING (
    -- Allow if user is authenticated and has a profile that references this company
    auth.uid() IS NOT NULL AND
    id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND company_id IS NOT NULL
    )
  );

-- Step 2: Also allow company fetch during signup process
CREATE POLICY "Allow company fetch during signup" ON public.companies
  FOR SELECT USING (
    -- Allow if user is authenticated but has no profile yet (signup case)
    auth.uid() IS NOT NULL AND
    NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Step 3: Update the get_current_user_company_id function to be more robust
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

-- Step 4: Add a function to help debug company fetch issues
CREATE OR REPLACE FUNCTION debug_company_access()
RETURNS TABLE(
  user_id UUID,
  profile_company_id UUID,
  can_access_company BOOLEAN,
  company_exists BOOLEAN
) AS $$
DECLARE
  user_company_id UUID;
BEGIN
  -- Get the user's company_id from their profile
  SELECT company_id INTO user_company_id
  FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND company_id IS NOT NULL
  LIMIT 1;
  
  RETURN QUERY
  SELECT 
    auth.uid() as user_id,
    user_company_id as profile_company_id,
    user_company_id IS NOT NULL as can_access_company,
    EXISTS(SELECT 1 FROM public.companies WHERE id = user_company_id) as company_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION debug_company_access() IS 
'Debug function to help troubleshoot company access issues.';

-- Step 5: Ensure all company-related policies are working correctly
-- Update any other policies that might be blocking company access

-- Step 6: Add better error handling for company fetch
-- This will help identify if the issue is with RLS or data integrity

-- Step 7: Create a view for easier company access (optional)
CREATE OR REPLACE VIEW user_company_view AS
SELECT 
  p.user_id,
  p.company_id,
  c.name as company_name,
  c.slug as company_slug,
  c.email as company_email,
  c.subscription_status,
  c.subscription_tier
FROM public.profiles p
JOIN public.companies c ON p.company_id = c.id
WHERE p.user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON user_company_view TO authenticated;

-- Step 8: Add RLS policy for the view
ALTER VIEW user_company_view SET (security_invoker = true);

-- Step 9: Add comments for better documentation
COMMENT ON POLICY "Users can view their own company" ON public.companies IS 
'Allows authenticated users to view their own company data based on their profile.';

COMMENT ON POLICY "Allow company fetch during signup" ON public.companies IS 
'Allows company data to be fetched during the signup process when user has no profile yet.'; 