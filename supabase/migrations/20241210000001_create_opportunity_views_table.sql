-- Create the opportunity_views table to track which run clubs have viewed which opportunities
CREATE TABLE IF NOT EXISTS "public"."opportunity_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "opportunity_id" "uuid" NOT NULL,
    "run_club_id" "uuid" NOT NULL,
    "viewed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("opportunity_id", "run_club_id")
);

-- Add foreign key constraints
ALTER TABLE "public"."opportunity_views" 
ADD CONSTRAINT "opportunity_views_opportunity_id_fkey" 
FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE CASCADE;

ALTER TABLE "public"."opportunity_views" 
ADD CONSTRAINT "opportunity_views_run_club_id_fkey" 
FOREIGN KEY ("run_club_id") REFERENCES "public"."run_club_profiles"("id") ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE "public"."opportunity_views" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow run clubs to insert their own views
CREATE POLICY "run_clubs_can_insert_own_views" ON "public"."opportunity_views"
FOR INSERT WITH CHECK (auth.uid() = run_club_id);

-- Allow brands to view counts for their own opportunities
CREATE POLICY "brands_can_view_own_opportunity_views" ON "public"."opportunity_views"
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.opportunities o 
        WHERE o.id = opportunity_id AND o.brand_id = auth.uid()
    )
);

-- Allow run clubs to view their own views (if needed for analytics)
CREATE POLICY "run_clubs_can_view_own_views" ON "public"."opportunity_views"
FOR SELECT USING (auth.uid() = run_club_id);

-- Add indexes for performance
CREATE INDEX "opportunity_views_opportunity_id_idx" ON "public"."opportunity_views" ("opportunity_id");
CREATE INDEX "opportunity_views_run_club_id_idx" ON "public"."opportunity_views" ("run_club_id");
CREATE INDEX "opportunity_views_viewed_at_idx" ON "public"."opportunity_views" ("viewed_at"); 