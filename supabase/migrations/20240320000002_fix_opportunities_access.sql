-- Fix opportunities access by adding proper RLS policies

-- Enable RLS on opportunities table if not already enabled
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.opportunities;
DROP POLICY IF EXISTS "Enable insert for authenticated brands" ON public.opportunities;
DROP POLICY IF EXISTS "Enable update for brand owners" ON public.opportunities;
DROP POLICY IF EXISTS "Enable delete for brand owners" ON public.opportunities;

-- Create policies for opportunities
CREATE POLICY "Enable read access for authenticated users"
ON public.opportunities
FOR SELECT
TO authenticated
USING (
  -- Allow access if user has a profile
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated brands"
ON public.opportunities
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow brands to create opportunities
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'brand'
  )
);

CREATE POLICY "Enable update for brand owners"
ON public.opportunities
FOR UPDATE
TO authenticated
USING (
  -- Only allow brand owners to update their own opportunities
  brand_id = auth.uid()
)
WITH CHECK (
  brand_id = auth.uid()
);

CREATE POLICY "Enable delete for brand owners"
ON public.opportunities
FOR DELETE
TO authenticated
USING (
  -- Only allow brand owners to delete their own opportunities
  brand_id = auth.uid()
);

-- Add a function to check if a user has access to opportunities
CREATE OR REPLACE FUNCTION public.check_opportunity_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- Set search path for the function
ALTER FUNCTION public.check_opportunity_access() SET search_path = public; 