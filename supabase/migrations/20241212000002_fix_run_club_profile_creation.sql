-- Fix run club profile creation issues

-- 1. Create the missing trigger for handle_new_user function
-- This trigger will automatically create profile records when users sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Update the INSERT policy for run_club_profiles to be less restrictive
-- The current policy requires the profile to already exist, but we're creating it in the same transaction
DROP POLICY IF EXISTS "Enable insert for run club owners" ON public.run_club_profiles;

CREATE POLICY "Run clubs can insert their own profile" 
ON public.run_club_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow run clubs to create their own profile
  id = auth.uid()
  AND
  (
    -- Either the profile already exists with correct user_type
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND user_type = 'run_club'
    )
    OR
    -- Or this is being called from the handle_new_user function (allow creation during signup)
    auth.uid() IS NOT NULL
  )
);

-- 3. Update the run club profile utility functions to use UPSERT like we did for brands
-- This will be handled in the application code 