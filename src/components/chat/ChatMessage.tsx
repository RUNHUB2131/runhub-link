
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType } from "@/services/chat";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
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
}

const ChatMessage = ({ message, chatParticipants }: ChatMessageProps) => {
  const { user } = useAuth();
  const isCurrentUser = user?.id === message.sender_id;
  
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };
  
  const getSenderInfo = () => {
    const isBrand = message.sender_type === "brand";
    
    if (isBrand) {
      return {
        name: chatParticipants.brand?.company_name || "Brand",
        image: chatParticipants.brand?.logo_url
      };
    } else {
      return {
        name: chatParticipants.runClub?.club_name || "Run Club",
        image: chatParticipants.runClub?.logo_url
      };
    }
  };
  
  const senderInfo = getSenderInfo();
  
  return (
    <div className={cn(
      "flex items-start gap-2 mb-4",
      isCurrentUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="h-8 w-8">
        {senderInfo.image ? (
          <AvatarImage src={senderInfo.image} alt={senderInfo.name} />
        ) : (
          <AvatarFallback>
            {senderInfo.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[70%]",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-2 rounded-lg",
          isCurrentUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-muted rounded-tl-none"
        )}>
          <p className="text-sm">{message.content}</p>
        </div>
        
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
