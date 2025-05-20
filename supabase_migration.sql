-- Add new columns
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS primary_contact_name text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS primary_contact_email text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS activation_overview text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS target_launch_date date;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS primary_objective text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS primary_objective_other text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS content_specifications text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS professional_media text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS media_requirements text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS club_responsibilities text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS club_incentives text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS geographic_locations text[];
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS club_size_preference text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS online_reach_preference text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS additional_notes text;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS submission_deadline date NOT NULL DEFAULT CURRENT_DATE;

-- Remove old columns (if they exist)
ALTER TABLE opportunities DROP COLUMN IF EXISTS description;
ALTER TABLE opportunities DROP COLUMN IF EXISTS reward;
ALTER TABLE opportunities DROP COLUMN IF EXISTS deadline;
ALTER TABLE opportunities DROP COLUMN IF EXISTS duration;
ALTER TABLE opportunities DROP COLUMN IF EXISTS requirements; 