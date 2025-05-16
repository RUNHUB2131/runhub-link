import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatList } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import ChatListItem from "@/components/chat/ChatListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";

const ChatListPage = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { chats, isLoading, refreshChats } = useChatList();
  
  const handleChatSelect = (id: string) => {
    navigate(`/chat/${id}`);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold mb-6">Chats</h1>
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="p-3 flex items-center gap-3 border rounded-md">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  const emptyStateMessage = userType === 'brand' 
    ? "Chat functionality becomes available when you accept a run club's application." 
    : "Chat functionality becomes available when a brand accepts your application.";
  
  if (chats.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Chats</h1>
        <div className="text-center p-12 border rounded-md">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium">No chats yet</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {emptyStateMessage}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Chats</h1>
      <div className="space-y-2">
        {chats.map((chat) => (
          <div key={chat.id} className="border rounded-md overflow-hidden">
            <ChatListItem
              chat={chat}
              onClick={() => {
                handleChatSelect(chat.id);
                refreshChats();
              }}
              refreshChats={refreshChats}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatListPage;
