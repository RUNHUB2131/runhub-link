
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationBadgeProps {
  onClick?: () => void;
}

const NotificationBadge = ({ onClick }: NotificationBadgeProps) => {
  const { unreadCount } = useNotifications();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="rounded-full relative"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default NotificationBadge;
