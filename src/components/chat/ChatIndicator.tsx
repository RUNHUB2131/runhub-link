import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ChatIndicator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (!user?.id) return;
    
    // Initial count of chats with unread messages
    const fetchUnreadCount = async () => {
      try {
        // Get all chats for the current user
        const { data: chats, error: chatsError } = await supabase
          .from('chats')
          .select('id')
          .or(`brand_id.eq.${user.id},run_club_id.eq.${user.id}`);
        
        if (chatsError) throw chatsError;
        
        if (!chats || chats.length === 0) {
          setUnreadCount(0);
          return;
        }
        
        // Count how many chats have unread messages
        const chatIds = chats.map(chat => chat.id);
        let chatsWithUnreadMessages = 0;
        
        for (const chatId of chatIds) {
          const { count, error: countError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chatId)
            .eq('read', false)
            .not('sender_id', 'eq', user.id);
          
          if (countError) throw countError;
          
          if ((count || 0) > 0) {
            chatsWithUnreadMessages++;
          }
        }
        
        setUnreadCount(chatsWithUnreadMessages);
      } catch (error) {
        console.error("Error fetching unread chats count:", error);
      }
    };
    
    fetchUnreadCount();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('chat-indicator')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const message = payload.new as any;
          
          // Only update if the message is not from the current user
          if (message && message.sender_id !== user.id) {
            // Refresh the count to ensure accuracy
            fetchUnreadCount();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `read=eq.true`
        },
        () => {
          // Refresh count when messages are marked as read
          fetchUnreadCount();
        }
      )
      .subscribe();
    
    // Check if the user is on a chat page and mark messages as read
    if (location.pathname.includes('/chat/') && user) {
      const chatId = location.pathname.split('/').pop();
      if (chatId) {
        // Mark messages as read
        const markMessagesAsRead = async () => {
          try {
            await supabase
              .from('chat_messages')
              .update({ read: true })
              .eq('chat_id', chatId)
              .not('sender_id', 'eq', user.id);
              
            // Update the unread count
            fetchUnreadCount();
          } catch (error) {
            console.error("Error marking messages as read:", error);
          }
        };
        
        markMessagesAsRead();
      }
    }
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, location.pathname]);

  const handleChatClick = () => {
    navigate("/chat");
  };
  
  return (
    <Button variant="ghost" size="icon" asChild className="relative text-[#f0f0f0] hover:bg-[#f0f0f0]/20 hover:text-[#f0f0f0]">
      <div onClick={handleChatClick}>
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  );
};

export default ChatIndicator;
