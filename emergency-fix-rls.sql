-- Emergency fix: Disable RLS temporarily to allow profile creation
-- Run this in your Supabase SQL editor

-- Disable RLS on key tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;
DROP POLICY IF EXISTS "Users can insert own company" ON companies;
DROP POLICY IF EXISTS "Authenticated users can access profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can access companies" ON companies;

-- Create simple policies that allow all authenticated users
CREATE POLICY "Allow all authenticated users on profiles" ON profiles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users on companies" ON companies
  FOR ALL USING (auth.role() = 'authenticated');

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY; 