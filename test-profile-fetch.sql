-- Test query to check existing profiles and companies
-- Run this in your Supabase SQL editor to see what data exists

-- Check all profiles
SELECT 
  id,
  user_id,
  company_id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Check all companies
SELECT 
  id,
  name,
  slug,
  email,
  subscription_status,
  subscription_tier,
  created_at
FROM companies
ORDER BY created_at DESC;

-- Check if there are any profiles for your user
-- Replace 'your-user-id-here' with your actual user ID from the logs
SELECT 
  p.id as profile_id,
  p.user_id,
  p.company_id,
  p.email as profile_email,
  c.id as company_id,
  c.name as company_name,
  c.email as company_email
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.user_id = 'b7e9f60b-e3d7-4345-a81c-a2d853ebc0ad'
ORDER BY p.created_at DESC; 