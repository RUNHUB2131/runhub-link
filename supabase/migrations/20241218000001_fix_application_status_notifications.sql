-- Fix application notification trigger to handle status updates
-- This adds notifications for run clubs when their application status changes

CREATE OR REPLACE FUNCTION "public"."handle_application_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    brand_id text;
    opportunity_title text;
    run_club_name text;
BEGIN
  -- Create notification for the brand when a new application is submitted
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      related_id
    )
    SELECT 
      o.brand_id,
      'New Application',
      'A new application has been submitted for ' || o.title,
      'new_application',
      NEW.id
    FROM public.opportunities o
    WHERE o.id = NEW.opportunity_id;
  END IF;
  
  -- Create notification for the run club when application status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Get opportunity details and run club name
    SELECT o.brand_id, o.title INTO brand_id, opportunity_title
    FROM public.opportunities o
    WHERE o.id = NEW.opportunity_id;
    
    -- Create notification for the run club about status change
    IF NEW.status IN ('accepted', 'rejected') THEN
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        related_id,
        read
      ) VALUES (
        NEW.run_club_id,
        CASE 
          WHEN NEW.status = 'accepted' THEN 'Application Accepted!'
          ELSE 'Application Status Update'
        END,
        CASE 
          WHEN NEW.status = 'accepted' THEN 'Great news! Your application for "' || opportunity_title || '" has been accepted.'
          ELSE 'Your application for "' || opportunity_title || '" has been rejected.'
        END,
        'application_status',
        NEW.id,
        false
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$; 