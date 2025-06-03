-- Add new city and state fields to run_club_profiles table
ALTER TABLE public.run_club_profiles 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- Create index for efficient state filtering
CREATE INDEX IF NOT EXISTS idx_run_club_profiles_state ON public.run_club_profiles(state);

-- Update existing data by parsing location field where possible
UPDATE public.run_club_profiles 
SET 
  city = CASE 
    WHEN location IS NOT NULL AND position(',' in location) > 0 
    THEN trim(split_part(location, ',', 1))
    ELSE location 
  END,
  state = CASE 
    WHEN location IS NOT NULL AND position(',' in location) > 0 
    THEN trim(split_part(location, ',', 2))
    ELSE NULL 
  END
WHERE city IS NULL AND state IS NULL; 