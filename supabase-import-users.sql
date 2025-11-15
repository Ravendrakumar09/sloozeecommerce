-- Import existing Supabase auth users to user_roles table
-- Run this in Supabase SQL Editor after creating the user_roles table

-- Insert all existing auth users as storekeeper (default role)
INSERT INTO public.user_roles (id, email, role, name)
SELECT 
  id,
  email,
  'storekeeper' as role,  -- Default all users to storekeeper
  COALESCE(raw_user_meta_data->>'name', SPLIT_PART(email, '@', 1)) as name
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_roles)
ON CONFLICT (id) DO NOTHING;

-- Verify the import
SELECT 
  ur.id,
  ur.email,
  ur.role,
  ur.name,
  au.created_at as auth_created_at
FROM public.user_roles ur
JOIN auth.users au ON ur.id = au.id
ORDER BY ur.created_at DESC;

