import { format } from "date-fns";
import { Chat } from "@/services/chat/types";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";

interface ChatListItemProps {
  chat: Chat;
  isActive?: boolean;
  onClick: () => void;
  refreshChats?: () => void;
}

const ChatListItem = ({ chat, isActive = false, onClick, refreshChats }: ChatListItemProps) => {
  const { user, userType } = useAuth();
  const { markChatAsRead } = useNotifications();
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return format(date, "HH:mm");
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return format(date, "EEE");
    } else {
      return format(date, "dd/MM");
    }
  };
  
  const getChatDisplayInfo = () => {
    if (!user) return { name: '', image: null };
    
    // Show the other participant's info
    if (chat.brand_profile && user.id !== chat.brand_id) {
      return {
        name: chat.brand_profile.company_name || 'Brand',
        image: chat.brand_profile.logo_url
      };
    } else if (chat.run_club_profile && user.id !== chat.run_club_id) {
      return {
        name: chat.run_club_profile.club_name || 'Run Club',
        image: chat.run_club_profile.logo_url
      };
    }
    
    return { name: 'Chat', image: null };
  };
  
  const handleChatClick = async () => {
    if (!user) return;
    
    try {
      // Mark messages in this chat as read
      await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('chat_id', chat.id)
        .not('sender_id', 'eq', user.id);
      
      // Mark chat notifications as read using the synchronized system
      if (chat.application_id) {
        await markChatAsRead(chat.application_id);
      }
      
      // Don't automatically refresh chats here to prevent infinite loops
      // The chat list will refresh when the user navigates back or page reloads
    } catch (error) {
      console.error("Error marking chat messages as read:", error);
    }
    
    // Call the original onClick handler
    onClick();
  };
  
  const { name, image } = getChatDisplayInfo();
  
  return (
    <div
      className={cn(
        "p-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-3",
        isActive && "bg-muted"
      )}
      onClick={handleChatClick}
    >
      <Avatar>
        {image ? (
          <AvatarImage src={image} alt={name} />
        ) : (
          <AvatarFallback>
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">{name}</h3>
          <div className="flex items-center gap-2">
            {(chat.unread_count || 0) > 0 && (
              <Badge variant="destructive">
                {chat.unread_count}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatTime(chat.updated_at)}
            </span>
          </div>
        </div>
        
        {chat.opportunity?.title && (
          <p className="text-sm text-muted-foreground truncate">
            {chat.opportunity.title}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
