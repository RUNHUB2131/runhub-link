-- Add quotes_requested fields to opportunities table
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS quotes_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS quotes_requested_at timestamp with time zone;

-- Add comment for documentation
COMMENT ON COLUMN public.opportunities.quotes_requested IS 'Whether the brand has requested RUNHUB to generate quotes for this opportunity';
COMMENT ON COLUMN public.opportunities.quotes_requested_at IS 'Timestamp when quotes were requested';

-- Create index for efficient querying of quote requests
CREATE INDEX IF NOT EXISTS idx_opportunities_quotes_requested 
ON public.opportunities(quotes_requested, quotes_requested_at) 
WHERE quotes_requested = true; 