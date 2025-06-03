-- Allow brands to view all run club profiles for the "All Clubs" feature
-- This replaces the existing restrictive policy that only allowed viewing profiles of clubs that applied to brand opportunities

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.run_club_profiles;

-- Create a new policy that allows brands to see all run club profiles
CREATE POLICY "Enable read access for authenticated users"
ON public.run_club_profiles
FOR SELECT
TO authenticated
USING (
  -- Allow run clubs to see their own profile
  (id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'run_club'
  ))
  OR
  -- Allow brands to see all run club profiles
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'brand'
  )
);

-- Create index for efficient filtering by state and member_count
CREATE INDEX IF NOT EXISTS idx_run_club_profiles_state_member_count 
ON public.run_club_profiles(state, member_count);

-- Create index for efficient text search on club_name and city
CREATE INDEX IF NOT EXISTS idx_run_club_profiles_text_search 
ON public.run_club_profiles USING gin(
  to_tsvector('english', coalesce(club_name, '') || ' ' || coalesce(city, ''))
); 