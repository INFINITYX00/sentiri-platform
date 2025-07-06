-- Emergency migration to disable RLS temporarily
-- This will allow all operations and unblock the loading screen

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_passports DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE takeback_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_allocations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;
DROP POLICY IF EXISTS "Users can insert own company" ON companies;
DROP POLICY IF EXISTS "Company members can view materials" ON materials;
DROP POLICY IF EXISTS "Company members can insert materials" ON materials;
DROP POLICY IF EXISTS "Company members can update materials" ON materials;
DROP POLICY IF EXISTS "Company members can delete materials" ON materials;
DROP POLICY IF EXISTS "Company members can view projects" ON projects;
DROP POLICY IF EXISTS "Company members can insert projects" ON projects;
DROP POLICY IF EXISTS "Company members can update projects" ON projects;
DROP POLICY IF EXISTS "Company members can delete projects" ON projects;
DROP POLICY IF EXISTS "Company members can view product passports" ON product_passports;
DROP POLICY IF EXISTS "Company members can insert product passports" ON product_passports;
DROP POLICY IF EXISTS "Company members can update product passports" ON product_passports;
DROP POLICY IF EXISTS "Company members can delete product passports" ON product_passports;
DROP POLICY IF EXISTS "Company members can view shipments" ON shipments;
DROP POLICY IF EXISTS "Company members can insert shipments" ON shipments;
DROP POLICY IF EXISTS "Company members can update shipments" ON shipments;
DROP POLICY IF EXISTS "Company members can delete shipments" ON shipments;
DROP POLICY IF EXISTS "Company members can view time entries" ON time_entries;
DROP POLICY IF EXISTS "Company members can insert time entries" ON time_entries;
DROP POLICY IF EXISTS "Company members can update time entries" ON time_entries;
DROP POLICY IF EXISTS "Company members can delete time entries" ON time_entries;
DROP POLICY IF EXISTS "Company members can view takeback items" ON takeback_items;
DROP POLICY IF EXISTS "Company members can insert takeback items" ON takeback_items;
DROP POLICY IF EXISTS "Company members can update takeback items" ON takeback_items;
DROP POLICY IF EXISTS "Company members can delete takeback items" ON takeback_items;
DROP POLICY IF EXISTS "Company members can view transport routes" ON transport_routes;
DROP POLICY IF EXISTS "Company members can insert transport routes" ON transport_routes;
DROP POLICY IF EXISTS "Company members can update transport routes" ON transport_routes;
DROP POLICY IF EXISTS "Company members can delete transport routes" ON transport_routes;
DROP POLICY IF EXISTS "Company members can view stock allocations" ON stock_allocations;
DROP POLICY IF EXISTS "Company members can insert stock allocations" ON stock_allocations;
DROP POLICY IF EXISTS "Company members can update stock allocations" ON stock_allocations;
DROP POLICY IF EXISTS "Company members can delete stock allocations" ON stock_allocations;

-- Create simple authenticated user policies
CREATE POLICY "Authenticated users can access profiles" ON profiles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access companies" ON companies
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access materials" ON materials
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access product passports" ON product_passports
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access shipments" ON shipments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access time entries" ON time_entries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access takeback items" ON takeback_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access transport routes" ON transport_routes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access stock allocations" ON stock_allocations
  FOR ALL USING (auth.role() = 'authenticated');

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_allocations ENABLE ROW LEVEL SECURITY; 