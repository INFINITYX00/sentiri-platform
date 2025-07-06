-- Clear all user data from the database
-- This will allow you to reuse email addresses for testing

-- First, disable RLS temporarily to avoid permission issues
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE boms DISABLE ROW LEVEL SECURITY;
ALTER TABLE material_passports DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_passports DISABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturing_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE energy_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE takeback_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE design_suggestions DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;

-- Clear all data from tables (in reverse dependency order)
DELETE FROM time_entries;
DELETE FROM energy_records;
DELETE FROM projects_materials;
DELETE FROM manufacturing_stages;
DELETE FROM material_passports;
DELETE FROM product_passports;
DELETE FROM boms;
DELETE FROM materials;
DELETE FROM projects;
DELETE FROM transport_routes;
DELETE FROM shipments;
DELETE FROM takeback_items;
DELETE FROM design_suggestions;
DELETE FROM subscribers;
DELETE FROM profiles;
DELETE FROM companies;

-- Clear all Supabase Auth users
-- This will prevent old users from being able to login
DELETE FROM auth.users;

-- Reset sequences if any
-- (PostgreSQL will handle this automatically, but we can be explicit)
-- ALTER SEQUENCE profiles_id_seq RESTART WITH 1;
-- ALTER SEQUENCE companies_id_seq RESTART WITH 1;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturing_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Verify the tables are empty
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'materials', COUNT(*) FROM materials
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'boms', COUNT(*) FROM boms
UNION ALL
SELECT 'material_passports', COUNT(*) FROM material_passports
UNION ALL
SELECT 'product_passports', COUNT(*) FROM product_passports
UNION ALL
SELECT 'manufacturing_stages', COUNT(*) FROM manufacturing_stages
UNION ALL
SELECT 'time_entries', COUNT(*) FROM time_entries
UNION ALL
SELECT 'energy_records', COUNT(*) FROM energy_records
UNION ALL
SELECT 'projects_materials', COUNT(*) FROM projects_materials;

-- Verify auth users are cleared
SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users;

-- Note: This script clears all data AND all auth users
-- You can now reuse any email addresses for testing
-- Old users will no longer be able to login 