
import { ArrowLeft, X } from "lucide-react";
import { Chat } from "@/services/chat";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  chat: Chat | null;
  onBack?: () => void;
  onClose?: () => void;
  isDrawer?: boolean;
}

const ChatHeader = ({ chat, onBack, onClose, isDrawer = false }: ChatHeaderProps) => {
  const { userType } = useAuth();
  
  if (!chat) {
    return (
      <div className="border-b p-4 flex items-center">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Chat</h2>
        </div>
        {isDrawer && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    );
  }
  
  // Determine which participant to show (the other party)
  const isBrand = userType === "brand";
  const otherParty = isBrand ? chat.run_club_profile : chat.brand_profile;
  const otherPartyName = isBrand
    ? chat.run_club_profile?.club_name || "Run Club"
    : chat.brand_profile?.company_name || "Brand";
  const otherPartyLogo = isBrand
    ? chat.run_club_profile?.logo_url
    : chat.brand_profile?.logo_url;
  
  return (
    <div className="border-b p-4 flex items-center gap-4">
      {onBack && (
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      
      <Avatar className="h-10 w-10">
        {otherPartyLogo ? (
          <AvatarImage src={otherPartyLogo} alt={otherPartyName} />
        ) : (
          <AvatarFallback>{otherPartyName.charAt(0).toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex-1">
        <h2 className="font-semibold">{otherPartyName}</h2>
        <p className="text-sm text-muted-foreground truncate">
          {chat.opportunity?.title || "Opportunity"}
        </p>
      </div>
      
      {isDrawer && onClose && (
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default ChatHeader;
