import { useEffect, useRef } from "react";
import { ChatMessage as ChatMessageType } from "@/services/chat";
import ChatMessage from "./ChatMessage";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  chatParticipants: {
    brand?: {
      company_name: string;
      logo_url?: string;
    };
    runClub?: {
      club_name: string;
      logo_url?: string;
    };
  };
  isLoading: boolean;
}

const ChatMessages = ({ messages, chatParticipants, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  if (isLoading) {
    return (
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex justify-center items-center h-full">
          <div className="animate-pulse text-center">
            <p>Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex justify-center items-center h-full">
          <div className="text-center text-muted-foreground">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message!</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((message) => (
        <ChatMessage 
          key={message.id} 
          message={message} 
          chatParticipants={chatParticipants}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
