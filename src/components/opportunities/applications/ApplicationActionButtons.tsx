import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { checkChatExistsForApplication } from "@/services/chat";
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
      <div className="flex flex-col gap-2 w-full">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onUpdateStatus(applicationId, "accepted")}
          className="w-full border-green-500 text-green-500 hover:bg-green-50 hover:border-green-600 hover:text-green-600"
        >
          Approve
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => onUpdateStatus(applicationId, "rejected")}
          className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600"
        >
          Reject
        </Button>
      </div>
    );
  }
  
  if (status === "accepted") {
    return (
      <Button 
        variant="outline"
        size="sm"
        className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
        onClick={handleChatClick}
      >
        <MessageCircle className="h-4 w-4" />
        Chat
      </Button>
    );
  }
  
  return null;
};

export default ApplicationActionButtons;
