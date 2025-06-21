
-- Clear all user-related data from the database
-- This will cascade and remove all associated data due to foreign key constraints

-- First, delete all profiles (this will also clean up associated company data)
DELETE FROM public.profiles;

-- Delete all companies (any remaining orphaned companies)
DELETE FROM public.companies;

-- Delete all subscribers
DELETE FROM public.subscribers;

-- Note: Users in auth.users will need to be deleted from the Supabase Auth dashboard
-- as they cannot be deleted via SQL for security reasons
