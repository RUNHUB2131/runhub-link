
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { checkChatExistsForApplication } from "@/services/chatService";
import ChatDrawer from "@/components/chat/ChatDrawer";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatMessageInput from "@/components/chat/ChatMessageInput";
import { useChat } from "@/hooks/useChat";

interface ApplicationActionButtonsProps {
  applicationId: string;
  status: "pending" | "accepted" | "rejected";
  onUpdateStatus: (applicationId: string, status: "accepted" | "rejected") => Promise<void>;
}

const ApplicationActionButtons = ({
  applicationId,
  status,
  onUpdateStatus
}: ApplicationActionButtonsProps) => {
  const { toast } = useToast();
  const [chatId, setChatId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const {
    chat,
    messages,
    isLoading,
    isSending,
    sendMessage
  } = useChat(chatId || '');
  
  const handleChatClick = async () => {
    if (status !== 'accepted') return;
    
    try {
      const existingChatId = await checkChatExistsForApplication(applicationId);
      
      if (existingChatId) {
        setChatId(existingChatId);
        setIsChatOpen(true);
      } else {
        toast({
          title: "Chat Not Available",
          description: "The chat for this application cannot be found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking chat existence:", error);
      toast({
        title: "Error",
        description: "Failed to open chat. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (status === "pending") {
    return (
      <div className="space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onUpdateStatus(applicationId, "accepted")}
          className="border-green-500 text-green-500 hover:bg-green-50"
        >
          Approve
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => onUpdateStatus(applicationId, "rejected")}
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          Reject
        </Button>
      </div>
    );
  }
  
  if (status === "accepted") {
    return (
      <div className="space-x-2">
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleChatClick}
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </Button>
        
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {chat?.brand_profile?.company_name || chat?.run_club_profile?.club_name || "Chat"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden flex flex-col">
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  return null;
};

export default ApplicationActionButtons;
