-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
DROP POLICY IF EXISTS "products_update_policy" ON public.products;
DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to read products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON public.products;

-- Policy: Allow authenticated users to read all products
CREATE POLICY "products_select_policy"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert products
CREATE POLICY "products_insert_policy"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update products
CREATE POLICY "products_update_policy"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete products (optional - you can remove this if you don't want delete)
CREATE POLICY "products_delete_policy"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on product updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

