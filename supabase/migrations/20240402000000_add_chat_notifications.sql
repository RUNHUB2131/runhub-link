-- Migration to add chat message notifications
-- This creates notifications in the main notification system when chat messages are sent

-- Function to handle chat message notifications
CREATE OR REPLACE FUNCTION public.handle_chat_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    recipient_id text;
    sender_name text;
    chat_info record;
    notification_title text;
    notification_message text;
BEGIN
    -- Get chat information
    SELECT c.brand_id, c.run_club_id, c.application_id 
    INTO chat_info
    FROM public.chats c
    WHERE c.id = NEW.chat_id;
    
    -- Determine recipient (the person who did NOT send the message)
    IF NEW.sender_type = 'brand' THEN
        recipient_id := chat_info.run_club_id;
        -- Get sender name from brand profile
        SELECT bp.company_name INTO sender_name
        FROM public.brand_profiles bp
        WHERE bp.id = NEW.sender_id;
        
        notification_title := 'New message from ' || COALESCE(sender_name, 'Brand');
    ELSE
        recipient_id := chat_info.brand_id;
        -- Get sender name from run club profile
        SELECT rcp.club_name INTO sender_name
        FROM public.run_club_profiles rcp
        WHERE rcp.id = NEW.sender_id;
        
        notification_title := 'New message from ' || COALESCE(sender_name, 'Run Club');
    END IF;
    
    -- Create notification message (truncate if too long)
    notification_message := NEW.content;
    IF LENGTH(notification_message) > 100 THEN
        notification_message := LEFT(notification_message, 97) || '...';
    END IF;
    
    -- Create the notification
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
        chat_info.application_id, -- Use application_id as related_id for navigation
        false
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE LOG 'Error in handle_chat_message_notification: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create trigger for chat message notifications
CREATE OR REPLACE TRIGGER on_chat_message_sent
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_chat_message_notification(); 