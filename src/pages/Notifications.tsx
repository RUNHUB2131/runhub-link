import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Notification, fetchNotifications, markNotificationAsRead, getOpportunityIdFromApplication } from "@/services/notificationService";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      const data = await fetchNotifications(user.id);
      setNotifications(data);
      setIsLoading(false);
    };

    loadNotifications();
  }, [user?.id]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, h:mm a");
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">All Notifications</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="py-4 hover:bg-gray-50 transition-colors rounded-md px-3 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{notification.title}</p>
                          {!notification.read && (
                            <Badge variant="default" className="bg-primary-500 text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-400">{formatDate(notification.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-lg">No notifications to show</p>
                <p className="text-gray-400 text-sm mt-2">
                  You'll see notifications here when there's activity on your account
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Notifications; 