-- Enable RLS on run_club_profiles table if not already enabled
ALTER TABLE public.run_club_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.run_club_profiles;
DROP POLICY IF EXISTS "Enable update for run club owners" ON public.run_club_profiles;
DROP POLICY IF EXISTS "Enable insert for run club owners" ON public.run_club_profiles;

-- Create policies for run_club_profiles
CREATE POLICY "Enable read access for authenticated users"
ON public.run_club_profiles
FOR SELECT
TO authenticated
USING (
  -- Allow access if user has a profile
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
  )
  OR
  -- Allow access if the run club has applied to an opportunity owned by the user
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.opportunities o ON a.opportunity_id = o.id
    WHERE a.run_club_id = run_club_profiles.id
    AND o.brand_id = auth.uid()
  )
);

CREATE POLICY "Enable update for run club owners"
ON public.run_club_profiles
FOR UPDATE
TO authenticated
USING (
  -- Only allow run clubs to update their own profile
  id = auth.uid()
  AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'run_club'
  )
);

CREATE POLICY "Enable insert for run club owners"
ON public.run_club_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow run clubs to create their own profile
  id = auth.uid()
  AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'run_club'
  )
); 