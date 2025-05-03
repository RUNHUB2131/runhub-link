
import { Skeleton } from "@/components/ui/skeleton";
import { Notification } from "@/services/notificationService";
import { format } from "date-fns";

interface RecentActivitySectionProps {
  notifications: Notification[];
  isLoading: boolean;
  notificationsLoading: boolean;
}

export const RecentActivitySection = ({ notifications, isLoading, notificationsLoading }: RecentActivitySectionProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, h:mm a");
  };

  return (
    <>
      <h2 className="text-2xl font-bold mt-12">Recent Activity</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading || notificationsLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(notification.created_at)}</p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 bg-primary-500 rounded-full"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No recent activity to show</p>
          </div>
        )}
      </div>
    </>
  );
};
