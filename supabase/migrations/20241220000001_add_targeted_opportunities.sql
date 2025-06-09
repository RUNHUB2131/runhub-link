-- Add target_run_club_id column to opportunities table
ALTER TABLE "public"."opportunities" 
ADD COLUMN "target_run_club_id" "uuid" REFERENCES "public"."run_club_profiles"("id") ON DELETE SET NULL;

-- Create index for efficient queries
CREATE INDEX "idx_opportunities_target_run_club_id" 
ON "public"."opportunities"("target_run_club_id");

-- Update RLS policy to handle targeted opportunities
-- Drop existing policy
DROP POLICY IF EXISTS "Allow all authenticated users to view opportunities" ON "public"."opportunities";

-- Create new policy that respects targeting
CREATE POLICY "Allow users to view appropriate opportunities" ON "public"."opportunities" 
FOR SELECT 
TO "authenticated" 
USING (
  -- Brands can see all their own opportunities
  (auth.uid() = brand_id)
  OR
  -- Run clubs can see non-targeted opportunities they haven't applied to
  (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'run_club')
    AND target_run_club_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.applications 
      WHERE opportunity_id = opportunities.id AND run_club_id = auth.uid()
    )
  )
  OR
  -- Run clubs can see opportunities specifically targeted to them
  (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'run_club')
    AND target_run_club_id = auth.uid()
  )
);

-- Add comment for clarity
COMMENT ON COLUMN "public"."opportunities"."target_run_club_id" 
IS 'If set, this opportunity is only visible to the specified run club. If NULL, visible to all run clubs.'; 