
-- Fix RLS policies to allow company and profile creation during signup

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- Create policy to allow inserting companies during signup
CREATE POLICY "Allow company creation during signup" ON public.companies
  FOR INSERT WITH CHECK (true);

-- Create policy to allow profile creation during signup  
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called when a user signs up, but we'll handle company/profile creation in the application
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
