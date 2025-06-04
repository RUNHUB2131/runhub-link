-- Add pitch field to applications table
-- This allows run clubs to submit a pitch when applying to opportunities

ALTER TABLE public.applications 
ADD COLUMN pitch text;

-- Add comment for documentation
COMMENT ON COLUMN public.applications.pitch IS 'Optional pitch text submitted by run clubs when applying to opportunities'; 