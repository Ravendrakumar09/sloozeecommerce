-- Add created_by column to products table if it doesn't exist
-- Run this if you created the products table without the created_by column

-- Check if column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'Column created_by added successfully';
  ELSE
    RAISE NOTICE 'Column created_by already exists';
  END IF;
END $$;

