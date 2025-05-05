
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatList } from "@/hooks/useChat";
import ChatListItem from "@/components/chat/ChatListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";

const ChatListPage = () => {
  const navigate = useNavigate();
  const { chats, isLoading } = useChatList();
  
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
  
  if (chats.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Chats</h1>
        <div className="text-center p-12 border rounded-md">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium">No chats yet</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Chat functionality becomes available when a brand accepts your application or when you accept a run club's application.
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
              onClick={() => handleChatSelect(chat.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatListPage;
