import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { findChatByApplicationId } from "@/services/chat/chatLookupService";
import { getOpportunityIdFromApplication } from "@/services/notificationService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const NotificationsDropdown = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (notificationId: string, type: string, relatedId: string | null) => {
    // Find the notification to check if it's already read
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Only mark as read if it's not already read
    if (!notification.read) {
      await markAsRead(notificationId);
    }
    
    // Handle different notification types
    if (relatedId) {
      try {
        switch (type) {
          case 'new_application':
          case 'application':
            // For new_application notifications, related_id is the application ID
            // We need to get the opportunity ID to navigate to the correct applications page
            const opportunityId = await getOpportunityIdFromApplication(relatedId);
            if (opportunityId) {
              setIsOpen(false);
              navigate(`/opportunities/${opportunityId}/applications`);
            } else {
              // Fallback to general applications page if we can't get the opportunity ID
              setIsOpen(false);
              navigate(`/applications`);
            }
            break;
          case 'new_chat':
            // Navigate to the appropriate chat
            const chatData = await findChatByApplicationId(relatedId);
            if (chatData && chatData.id) {
              setIsOpen(false);
              navigate(`/chat/${chatData.id}`);
            }
            break;
          case 'application_status':
            setIsOpen(false);
            navigate(`/applications`);
            break;
          case 'opportunity':
            setIsOpen(false);
            navigate(`/opportunities`);
            break;
          case 'targeted_opportunity':
            // Navigate to the specific opportunity page for targeted opportunities
            setIsOpen(false);
            navigate(`/opportunities/${relatedId}`);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error handling notification click:", error);
        toast({
          title: "Error",
          description: "Failed to navigate",
          variant: "destructive",
        });
      }
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unreadCount === 0) return; // Don't proceed if there are no unread notifications
    
    try {
      await markAllAsRead();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, h:mm a");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative focus:outline-none focus:ring-0 notification-bell-btn text-[#f0f0f0] hover:bg-[#f0f0f0]/20 hover:text-[#f0f0f0]">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px]">
        <div className="flex items-center justify-between py-2 px-4">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 flex items-center gap-1"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        
        <div className="max-h-[300px] overflow-y-auto py-1">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`p-3 cursor-pointer flex flex-col items-start gap-1 ${!notification.read ? 'bg-slate-50' : ''}`}
                onClick={() => handleNotificationClick(notification.id, notification.type, notification.related_id)}
              >
                <div className="flex justify-between w-full">
                  <span className="font-medium text-sm">{notification.title}</span>
                  <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
                {!notification.read && (
                  <div className="flex justify-end w-full">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark as read
                    </Button>
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
