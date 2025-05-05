
import { useEffect } from "react";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useChat } from "@/hooks/useChat";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatMessageInput from "./ChatMessageInput";

interface ChatDrawerProps {
  chatId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChatDrawer = ({ chatId, isOpen, onOpenChange }: ChatDrawerProps) => {
  const {
    chat,
    messages,
    isLoading,
    isSending,
    sendMessage,
    refreshChat
  } = useChat(chatId || '');
  
  // Refresh the chat when the drawer opens
  useEffect(() => {
    if (isOpen && chatId) {
      refreshChat();
    }
  }, [isOpen, chatId, refreshChat]);
  
  if (!chatId) return null;
  
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[80vh] flex flex-col">
        <DrawerHeader className="p-0">
          <ChatHeader 
            chat={chat} 
            onClose={() => onOpenChange(false)}
            isDrawer={true}
          />
        </DrawerHeader>
        
        <ChatMessages 
          messages={messages} 
          chatParticipants={{
            brand: chat?.brand_profile,
            runClub: chat?.run_club_profile
          }} 
          isLoading={isLoading} 
        />
        
        <ChatMessageInput 
          onSendMessage={sendMessage} 
          isSending={isSending} 
        />
      </DrawerContent>
    </Drawer>
  );
};

export default ChatDrawer;
