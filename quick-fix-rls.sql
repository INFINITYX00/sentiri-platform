-- Quick fix: Temporarily disable RLS to allow existing users to access their data
-- This will let you log in immediately without setup screens

-- Disable RLS on profiles and companies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;
DROP POLICY IF EXISTS "Users can insert own company" ON companies;
DROP POLICY IF EXISTS "Authenticated users can access profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can access companies" ON companies;
DROP POLICY IF EXISTS "Allow all authenticated users on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all authenticated users on companies" ON companies;

-- Create simple policies that allow all operations for authenticated users
CREATE POLICY "profiles_policy" ON profiles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "companies_policy" ON companies
  FOR ALL USING (auth.role() = 'authenticated');

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY; 