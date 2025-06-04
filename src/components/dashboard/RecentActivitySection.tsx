import { Skeleton } from "@/components/ui/skeleton";
import { Notification } from "@/services/notificationService";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getOpportunityIdFromApplication } from "@/services/notificationService";

interface RecentActivitySectionProps {
  notifications: Notification[];
  isLoading: boolean;
  notificationsLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
}

export const RecentActivitySection = ({ 
  notifications, 
  isLoading, 
  notificationsLoading,
  markAsRead
}: RecentActivitySectionProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, h:mm a");
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read using the passed function
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.related_id) {
      switch (notification.type) {
        case 'application':
        case 'new_application':
          // For new_application notifications, related_id is the application ID
          // We need to get the opportunity ID to navigate to the correct applications page
          const opportunityId = await getOpportunityIdFromApplication(notification.related_id);
          if (opportunityId) {
            navigate(`/opportunities/${opportunityId}/applications`);
          } else {
            // Fallback to general applications page if we can't get the opportunity ID
            navigate(`/applications`);
          }
          break;
        case 'application_status':
          navigate(`/applications`);
          break;
        case 'opportunity':
          navigate(`/opportunities`);
          break;
        case 'chat':
        case 'new_chat':
          navigate(`/chat`);
          break;
        default:
          break;
      }
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold">Recent Activity</CardTitle>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/notifications" className="flex items-center gap-1">
              <Bell size={16} /> View all
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading || notificationsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id} 
                className="py-3 hover:bg-gray-50 transition-colors rounded-md px-2 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{notification.title}</p>
                      {!notification.read && (
                        <Badge variant="default" className="bg-primary-500 text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(notification.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No recent activity to show</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
