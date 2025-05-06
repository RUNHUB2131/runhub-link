
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { checkChatExistsForApplication } from "@/services/chatService";
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
  const navigate = useNavigate();
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
        // Navigate to the chat page with the chat ID
        navigate(`/chat/${existingChatId}`);
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
      </div>
    );
  }
  
  return null;
};

export default ApplicationActionButtons;
