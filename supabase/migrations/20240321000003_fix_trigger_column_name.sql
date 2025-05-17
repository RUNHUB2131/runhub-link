-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_new_application ON public.applications;
DROP FUNCTION IF EXISTS public.handle_new_application_notification();

-- Recreate the function with the correct column name
CREATE OR REPLACE FUNCTION public.handle_new_application_notification()
RETURNS TRIGGER AS $$
DECLARE
    brand_id text;
    opportunity_title text;
    run_club_name text;
    error_message text;
BEGIN
    -- Get the brand_id and opportunity title
    BEGIN
        SELECT o.brand_id, o.title INTO brand_id, opportunity_title
        FROM public.opportunities o
        WHERE o.id = NEW.opportunity_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Opportunity not found: %', NEW.opportunity_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Error getting opportunity details: ' || SQLERRM;
        RAISE LOG '%', error_message;
        RETURN NEW;
    END;

    -- Get the run club name
    BEGIN
        SELECT rcp.club_name INTO run_club_name
        FROM public.run_club_profiles rcp
        WHERE rcp.id = NEW.run_club_id;
        
        IF NOT FOUND THEN
            RAISE LOG 'Run club profile not found for ID: %', NEW.run_club_id;
            run_club_name := 'Unknown Run Club';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Error getting run club name: ' || SQLERRM;
        RAISE LOG '%', error_message;
        run_club_name := 'Unknown Run Club';
    END;

    -- Create notification for the brand
    BEGIN
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            related_id,
            read
        ) VALUES (
            brand_id,
            'New Application Received',
            run_club_name || ' has applied to "' || opportunity_title || '"',
            'new_application',
            NEW.id,
            false
        );
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Error creating notification: ' || SQLERRM;
        RAISE LOG '%', error_message;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_new_application
    AFTER INSERT ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_application_notification(); 