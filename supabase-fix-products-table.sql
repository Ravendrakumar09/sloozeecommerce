-- Fix products table structure - Add missing columns if they don't exist
-- This script will add any missing columns to match the expected schema

-- Add name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.products ADD COLUMN name TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Column name added';
  END IF;
END $$;

-- Add description column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'description'
  ) THEN
    ALTER TABLE public.products ADD COLUMN description TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Column description added';
  END IF;
END $$;

-- Add price column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'price'
  ) THEN
    ALTER TABLE public.products ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0);
    RAISE NOTICE 'Column price added';
  END IF;
END $$;

-- Add quantity column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE public.products ADD COLUMN quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0);
    RAISE NOTICE 'Column quantity added';
  END IF;
END $$;

-- Add category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.products ADD COLUMN category TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Column category added';
  END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Column created_at added';
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Column updated_at added';
  END IF;
END $$;

-- Add created_by column if it doesn't exist (optional)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.products ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Column created_by added';
  END IF;
END $$;

-- Remove default values from required columns (after data is added)
-- This is optional - only run if you want to enforce NOT NULL without defaults
-- ALTER TABLE public.products ALTER COLUMN name DROP DEFAULT;
-- ALTER TABLE public.products ALTER COLUMN description DROP DEFAULT;
-- ALTER TABLE public.products ALTER COLUMN category DROP DEFAULT;

