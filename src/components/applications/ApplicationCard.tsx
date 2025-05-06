
import { useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Clock, Check, X, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Application } from "@/types";
import { checkChatExistsForApplication } from "@/services/chat";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatMessageInput from "@/components/chat/ChatMessageInput";

interface ApplicationWithOpportunity extends Application {
  opportunities?: {
    id: string;
    title: string;
    description: string;
    brand_id: string;
    reward: string;
    deadline: string | null;
    created_at: string;
    brand?: {
      company_name: string;
      logo_url?: string;
    } | null;
  };
}

interface ApplicationCardProps {
  application: ApplicationWithOpportunity;
  onWithdraw?: (applicationId: string) => void;
}

const ApplicationCard = ({ application, onWithdraw }: ApplicationCardProps) => {
  const { toast } = useToast();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const {
    chat,
    messages,
    isLoading,
    isSending,
    sendMessage
  } = useChat(chatId || '');
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "accepted": return <Check className="h-4 w-4" />;
      case "rejected": return <X className="h-4 w-4" />;
      default: return null;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-amber-100 text-amber-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleWithdraw = async () => {
    if (!onWithdraw) return;
    
    setIsWithdrawing(true);
    try {
      await onWithdraw(application.id);
    } finally {
      setIsWithdrawing(false);
    }
  };
  
  const handleChatClick = async () => {
    if (application.status !== 'accepted') return;
    
    try {
      const existingChatId = await checkChatExistsForApplication(application.id);
      
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
  
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge 
            className={`${getStatusColor(application.status)} flex w-fit items-center gap-1 border-none`}
          >
            {getStatusIcon(application.status)}
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
          
          <div className="text-sm text-muted-foreground">
            {format(new Date(application.created_at), "MMM d, yyyy")}
          </div>
        </div>
        
        <CardTitle className="mt-2 text-lg">
          {application.opportunities?.title || "Untitled Opportunity"}
        </CardTitle>
        
        {application.opportunities?.brand && (
          <CardDescription>
            {application.opportunities.brand.company_name || "Unknown Brand"}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {application.opportunities?.description || "No description available."}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/opportunities/${application.opportunity_id}`}>
              View Details
            </Link>
          </Button>
          
          {onWithdraw && application.status === "pending" && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw"}
            </Button>
          )}
        </div>
        
        {application.status === "accepted" && (
          <>
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
                    {application.opportunities?.brand?.company_name || "Chat"}
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
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;
