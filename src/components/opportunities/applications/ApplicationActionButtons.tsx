
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { checkChatExistsForApplication } from "@/services/chatService";
import ChatDrawer from "@/components/chat/ChatDrawer";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const [chatId, setChatId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const handleChatClick = async () => {
    if (status !== 'accepted') return;
    
    try {
      const existingChatId = await checkChatExistsForApplication(applicationId);
      
      if (existingChatId) {
        setChatId(existingChatId);
        setIsDrawerOpen(true);
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
  
  const handleOpenFullChat = async () => {
    if (status !== 'accepted') return;
    
    try {
      const existingChatId = await checkChatExistsForApplication(applicationId);
      
      if (existingChatId) {
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
          Quick Chat
        </Button>
        
        <Button 
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleOpenFullChat}
        >
          <MessageCircle className="h-4 w-4" />
          Open Full Chat
        </Button>
        
        <ChatDrawer 
          chatId={chatId} 
          isOpen={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen}
        />
      </div>
    );
  }
  
  return null;
};

export default ApplicationActionButtons;
