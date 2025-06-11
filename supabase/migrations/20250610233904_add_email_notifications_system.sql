-- Migration to add email notification preferences and enhanced triggers
-- This adds email notification support to the existing notification system

-- Add email notification preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_new_applications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_application_updates boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_new_messages boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_new_opportunities boolean DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_notifications ON public.profiles(email_notifications_enabled);

-- Function to send email notification via Edge Function
CREATE OR REPLACE FUNCTION public.send_email_notification(
    email_type text,
    recipient_email text,
    recipient_name text,
    email_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Call the Edge Function to send email notification
    -- Using pg_net extension for HTTP requests
    PERFORM
        net.http_post(
            url := current_setting('app.supabase_url') || '/functions/v1/send-notification-email',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
            ),
            body := jsonb_build_object(
                'type', email_type,
                'to', recipient_email,
                'recipientName', recipient_name,
                'data', email_data
            )
        );
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE LOG 'Error sending email notification: %', SQLERRM;
END;
$$;

-- Enhanced function to handle application notifications with email
CREATE OR REPLACE FUNCTION public.handle_application_with_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    brand_id text;
    opportunity_title text;
    brand_name text;
    brand_email text;
    brand_email_enabled boolean;
    brand_new_app_enabled boolean;
    club_name text;
    club_email text;
    club_email_enabled boolean;
    club_app_updates_enabled boolean;
BEGIN
    -- Get opportunity and brand info
    SELECT o.brand_id, o.title INTO brand_id, opportunity_title
    FROM public.opportunities o
    WHERE o.id = COALESCE(NEW.opportunity_id, OLD.opportunity_id);
    
    -- Get brand details with email preferences
    SELECT bp.company_name, u.email, p.email_notifications_enabled, p.email_new_applications
    INTO brand_name, brand_email, brand_email_enabled, brand_new_app_enabled
    FROM public.brand_profiles bp
    JOIN auth.users u ON u.id = bp.id
    JOIN public.profiles p ON p.id = bp.id
    WHERE bp.id = brand_id;
    
    -- Get run club details with email preferences
    SELECT rcp.club_name, u.email, p.email_notifications_enabled, p.email_application_updates
    INTO club_name, club_email, club_email_enabled, club_app_updates_enabled
    FROM public.run_club_profiles rcp
    JOIN auth.users u ON u.id = rcp.id
    JOIN public.profiles p ON p.id = rcp.id
    WHERE rcp.id = COALESCE(NEW.run_club_id, OLD.run_club_id);

    -- Handle new application
    IF TG_OP = 'INSERT' THEN
        -- Create in-app notification for brand
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            related_id,
            read
        ) VALUES (
            brand_id,
            'New Application',
            club_name || ' has applied to "' || opportunity_title || '"',
            'new_application',
            NEW.id,
            false
        );
        
        -- Send email notification to brand (if enabled)
        IF brand_email_enabled AND brand_new_app_enabled THEN
            PERFORM public.send_email_notification(
                'new_application',
                brand_email,
                brand_name,
                jsonb_build_object(
                    'senderName', club_name,
                    'opportunityTitle', opportunity_title
                )
            );
        END IF;
        
    END IF;
    
    -- Handle application status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status IN ('accepted', 'rejected') THEN
        -- Create in-app notification for run club
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
        
        -- Send email notification to run club (if enabled)
        IF club_email_enabled AND club_app_updates_enabled THEN
            PERFORM public.send_email_notification(
                'application_status',
                club_email,
                club_name,
                jsonb_build_object(
                    'opportunityTitle', opportunity_title,
                    'applicationStatus', NEW.status
                )
            );
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE LOG 'Error in handle_application_with_email: %', SQLERRM;
        RETURN COALESCE(NEW, OLD);
END;
$$;

-- Enhanced function to handle chat message notifications with email (only run clubs get emails)
CREATE OR REPLACE FUNCTION public.handle_chat_with_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    recipient_id text;
    sender_name text;
    recipient_name text;
    recipient_email text;
    chat_info record;
    opportunity_title text;
    notification_title text;
    notification_message text;
    email_enabled boolean;
    messages_enabled boolean;
BEGIN
    -- Get chat information
    SELECT c.brand_id, c.run_club_id, c.application_id, c.opportunity_id
    INTO chat_info
    FROM public.chats c
    WHERE c.id = NEW.chat_id;
    
    -- Get opportunity title
    SELECT o.title INTO opportunity_title
    FROM public.opportunities o
    WHERE o.id = chat_info.opportunity_id;
    
    -- Determine recipient and sender information
    IF NEW.sender_type = 'brand' THEN
        recipient_id := chat_info.run_club_id;
        
        -- Get sender name from brand profile
        SELECT bp.company_name INTO sender_name
        FROM public.brand_profiles bp
        WHERE bp.id = NEW.sender_id;
        
        -- Get recipient info with email preferences (run club)
        SELECT rcp.club_name, u.email, p.email_notifications_enabled, p.email_new_messages
        INTO recipient_name, recipient_email, email_enabled, messages_enabled
        FROM public.run_club_profiles rcp
        JOIN auth.users u ON u.id = rcp.id
        JOIN public.profiles p ON p.id = rcp.id
        WHERE rcp.id = recipient_id;
        
        notification_title := 'New message from ' || COALESCE(sender_name, 'Brand');
    ELSE
        recipient_id := chat_info.brand_id;
        
        -- Get sender name from run club profile
        SELECT rcp.club_name INTO sender_name
        FROM public.run_club_profiles rcp
        WHERE rcp.id = NEW.sender_id;
        
        -- Get recipient info (brand - no email for brands)
        SELECT bp.company_name, u.email, false as email_notifications_enabled, false as email_new_messages
        INTO recipient_name, recipient_email, email_enabled, messages_enabled
        FROM public.brand_profiles bp
        JOIN auth.users u ON u.id = bp.id
        WHERE bp.id = recipient_id;
        
        notification_title := 'New message from ' || COALESCE(sender_name, 'Run Club');
    END IF;
    
    -- Create notification message (truncate if too long)
    notification_message := NEW.content;
    IF LENGTH(notification_message) > 100 THEN
        notification_message := LEFT(notification_message, 97) || '...';
    END IF;
    
    -- Create in-app notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        related_id,
        read
    ) VALUES (
        recipient_id,
        notification_title,
        notification_message,
        'new_chat',
        chat_info.application_id,
        false
    );
    
    -- Send email notification (only for run clubs when message is from brand)
    IF NEW.sender_type = 'brand' AND email_enabled AND messages_enabled THEN
        PERFORM public.send_email_notification(
            'new_message',
            recipient_email,
            recipient_name,
            jsonb_build_object(
                'senderName', sender_name,
                'messagePreview', notification_message
            )
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE LOG 'Error in handle_chat_with_email: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- New function to handle new opportunity notifications for run clubs
CREATE OR REPLACE FUNCTION public.handle_new_opportunity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    club_info record;
    brand_name text;
    deadline_text text;
BEGIN
    -- Get brand name
    SELECT bp.company_name INTO brand_name 
    FROM public.brand_profiles bp 
    WHERE bp.id = NEW.brand_id;
    
    -- Format deadline
    deadline_text := CASE WHEN NEW.submission_deadline IS NOT NULL 
                         THEN NEW.submission_deadline::text 
                         ELSE NULL END;
    
    -- Notify all run clubs with email preferences enabled
    FOR club_info IN 
        SELECT rcp.id, rcp.club_name, u.email, p.email_notifications_enabled, p.email_new_opportunities
        FROM public.run_club_profiles rcp
        JOIN auth.users u ON u.id = rcp.id
        JOIN public.profiles p ON p.id = rcp.id
        WHERE p.email_notifications_enabled = true
    LOOP
        -- Create in-app notification
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            related_id,
            read
        ) VALUES (
            club_info.id,
            'New Opportunity Available',
            'New sponsorship opportunity: "' || NEW.title || '" by ' || COALESCE(brand_name, 'Brand'),
            'new_opportunity',
            NEW.id,
            false
        );
        
        -- Send email notification (if enabled)
        IF club_info.email_notifications_enabled AND club_info.email_new_opportunities THEN
            PERFORM public.send_email_notification(
                'new_opportunity',
                club_info.email,
                club_info.club_name,
                jsonb_build_object(
                    'opportunityTitle', NEW.title,
                    'deadline', deadline_text
                )
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE LOG 'Error in handle_new_opportunity: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Replace existing triggers with enhanced versions
DROP TRIGGER IF EXISTS on_application_created ON public.applications;
DROP TRIGGER IF EXISTS on_application_updated ON public.applications;
DROP TRIGGER IF EXISTS on_new_application ON public.applications;
DROP TRIGGER IF EXISTS on_chat_message_sent ON public.chat_messages;
DROP TRIGGER IF EXISTS on_chat_message_with_email ON public.chat_messages;

-- Create new triggers
CREATE TRIGGER on_application_with_email
    AFTER INSERT OR UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_application_with_email();

CREATE TRIGGER on_chat_with_email
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_chat_with_email();

CREATE TRIGGER on_new_opportunity
    AFTER INSERT ON public.opportunities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_opportunity();
