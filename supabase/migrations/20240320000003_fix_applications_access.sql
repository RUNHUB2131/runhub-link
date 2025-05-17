-- Enable RLS on applications table if not already enabled
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.applications;
DROP POLICY IF EXISTS "Enable insert for authenticated run clubs" ON public.applications;
DROP POLICY IF EXISTS "Enable update for brand owners" ON public.applications;
DROP POLICY IF EXISTS "Enable delete for run club owners" ON public.applications;

-- Create policies for applications
CREATE POLICY "Enable read access for authenticated users"
ON public.applications
FOR SELECT
TO authenticated
USING (
  -- Allow access if user has a profile
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated run clubs"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow run clubs to create applications
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'run_club'
  )
  AND
  -- Ensure the run_club_id matches the authenticated user
  run_club_id = auth.uid()
);

CREATE POLICY "Enable update for brand owners"
ON public.applications
FOR UPDATE
TO authenticated
USING (
  -- Only allow brand owners to update applications for their opportunities
  EXISTS (
    SELECT 1 FROM public.opportunities
    WHERE id = opportunity_id
    AND brand_id = auth.uid()
  )
)
WITH CHECK (
  -- Only allow updating the status field
  status IS NOT NULL
  AND
  -- Ensure the brand owns the opportunity
  EXISTS (
    SELECT 1 FROM public.opportunities
    WHERE id = opportunity_id
    AND brand_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for run club owners"
ON public.applications
FOR DELETE
TO authenticated
USING (
  -- Only allow run clubs to delete their own applications
  run_club_id = auth.uid()
  AND
  -- Only allow deletion if the application is pending
  status = 'pending'
); 