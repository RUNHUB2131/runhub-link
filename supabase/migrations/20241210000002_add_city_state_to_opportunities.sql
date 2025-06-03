-- Add new city and state fields to opportunities table
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- Create index for efficient state filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_state ON public.opportunities(state);
CREATE INDEX IF NOT EXISTS idx_opportunities_city ON public.opportunities(city);

-- Update existing data by parsing geographic_locations field where possible
UPDATE public.opportunities 
SET 
  city = CASE 
    WHEN geographic_locations IS NOT NULL 
         AND array_length(geographic_locations, 1) >= 1 
         AND geographic_locations[1] IS NOT NULL 
    THEN trim(geographic_locations[1])
    ELSE NULL 
  END,
  state = CASE 
    WHEN geographic_locations IS NOT NULL 
         AND array_length(geographic_locations, 1) >= 2 
         AND geographic_locations[2] IS NOT NULL 
    THEN trim(geographic_locations[2])
    ELSE NULL 
  END
WHERE city IS NULL AND state IS NULL; 