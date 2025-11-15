-- Create a users table to store role information
-- This table will be linked to Supabase auth.users

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'storekeeper')),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role
CREATE POLICY "Users can view own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Service role can do everything (for server-side operations)
CREATE POLICY "Service role can manage roles"
  ON public.user_roles
  FOR ALL
  USING (auth.role() = 'service_role');

-- Note: We're not auto-creating user_roles on signup since we only allow login
-- Users will be imported via supabase-import-users.sql script
-- Or created automatically on first login (see login route)

-- Create a function to get user role (for use in queries)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

