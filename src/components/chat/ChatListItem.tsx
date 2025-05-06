
import { format } from "date-fns";
import { Chat } from "@/services/chat";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ChatListItemProps {
  chat: Chat;
  isActive?: boolean;
  onClick: () => void;
}

const ChatListItem = ({ chat, isActive = false, onClick }: ChatListItemProps) => {
  const { userType, user } = useAuth();
  
  // Determine which participant to show (the other party)
  const isBrand = userType === "brand";
  const otherParty = isBrand ? chat.run_club_profile : chat.brand_profile;
  const otherPartyName = isBrand
    ? chat.run_club_profile?.club_name || "Run Club"
    : chat.brand_profile?.company_name || "Brand";
  const otherPartyLogo = isBrand
    ? chat.run_club_profile?.logo_url
    : chat.brand_profile?.logo_url;
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If the date is today, show the time
    if (date.toDateString() === now.toDateString()) {
      return format(date, "h:mm a");
    }
    
    // If the date is within the last week, show the day name
    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return format(date, "EEE");
    }
    
    // Otherwise show the date
    return format(date, "MMM d");
  };

  // Handler for clicking on a chat
  const handleChatClick = async () => {
    if (!user?.id || !chat.id) {
      onClick();
      return;
    }
    
    try {
      // Mark all messages in this chat as read when clicking on it
      await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('chat_id', chat.id)
        .not('sender_id', 'eq', user.id);
      
      // Clear notification indicators
      if (chat.application_id) {
        try {
          // Get notifications related to this chat
          const { data: notifications } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('type', 'new_chat')
            .eq('related_id', chat.application_id)
            .eq('read', false);
          
          if (notifications && notifications.length > 0) {
            // Mark notifications as read
            const notificationIds = notifications.map(notif => notif.id);
            await supabase
              .from('notifications')
              .update({ read: true })
              .in('id', notificationIds);
          }
        } catch (error) {
          console.error("Error marking chat notifications as read:", error);
        }
      }
    } catch (error) {
      console.error("Error marking chat messages as read:", error);
    }
    
    // Call the original onClick handler
    onClick();
  };
  
  return (
    <div 
      className={cn(
        "p-3 flex items-center gap-3 cursor-pointer hover:bg-muted transition-colors",
        isActive && "bg-muted"
      )}
      onClick={handleChatClick}
    >
      <Avatar className="h-12 w-12">
        {otherPartyLogo ? (
          <AvatarImage src={otherPartyLogo} alt={otherPartyName} />
        ) : (
          <AvatarFallback>{otherPartyName.charAt(0).toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold truncate">{otherPartyName}</h3>
          <span className="text-xs text-muted-foreground">
            {formatDate(chat.updated_at)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground truncate">
          {chat.opportunity?.title || "Opportunity"}
        </p>
      </div>
      
      {(chat.unread_count || 0) > 0 && (
        <Badge variant="default" className="ml-auto">
          {chat.unread_count}
        </Badge>
      )}
    </div>
  );
};

export default ChatListItem;
