
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatList, useChat } from "@/hooks/useChat";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatMessageInput from "@/components/chat/ChatMessageInput";
import ChatListItem from "@/components/chat/ChatListItem";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { chats, isLoading: isLoadingChats } = useChatList();
  const {
    chat,
    messages,
    isLoading: isLoadingMessages,
    isSending,
    sendMessage
  } = useChat(chatId || '');
  
  const handleChatSelect = (id: string) => {
    navigate(`/chat/${id}`);
  };
  
  const renderChatList = () => {
    if (isLoadingChats) {
      return Array(5).fill(0).map((_, i) => (
        <div key={i} className="p-3 flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ));
    }
    
    if (chats.length === 0) {
      return (
        <div className="p-6 text-center">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h3 className="font-medium">No chats yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            When you have accepted applications, chats will appear here.
          </p>
        </div>
      );
    }
    
    return chats.map((chatItem) => (
      <ChatListItem
        key={chatItem.id}
        chat={chatItem}
        isActive={chatItem.id === chatId}
        onClick={() => handleChatSelect(chatItem.id)}
      />
    ));
  };
  
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="text-2xl font-bold p-4 md:hidden">Chats</h1>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-full md:w-80 border-r hidden md:block overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <div className="divide-y">{renderChatList()}</div>
        </div>
        
        {/* Chat Area */}
        {chatId ? (
          <div className="flex flex-col flex-1">
            <ChatHeader 
              chat={chat} 
              onBack={() => navigate("/chat")} 
            />
            
            <ChatMessages 
              messages={messages} 
              chatParticipants={{
                brand: chat?.brand_profile,
                runClub: chat?.run_club_profile
              }} 
              isLoading={isLoadingMessages} 
            />
            
            <ChatMessageInput 
              onSendMessage={sendMessage} 
              isSending={isSending} 
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 bg-muted/10">
            <div className="text-center max-w-md">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
              <p className="text-muted-foreground mb-4">
                Choose a conversation from the list to start messaging
              </p>
              <Button 
                onClick={() => navigate("/chat")} 
                className="md:hidden"
              >
                View All Conversations
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
