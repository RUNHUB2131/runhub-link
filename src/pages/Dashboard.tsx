
import { useNotifications } from "@/hooks/useNotifications";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivitySection } from "@/components/dashboard/RecentActivitySection";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const Dashboard = () => {
  const { userType } = useAuth();
  const { notifications, isLoading: notificationsLoading } = useNotifications();
  const { isLoading, profileCompletionPercentage, stats } = useDashboardData();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <DashboardHeader userType={userType} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProfileCompletionCard 
          isLoading={isLoading} 
          percentage={profileCompletionPercentage} 
        />
        <StatsCards 
          userType={userType!} 
          isLoading={isLoading} 
          stats={stats} 
        />
      </div>

      <RecentActivitySection 
        notifications={notifications}
        isLoading={isLoading}
        notificationsLoading={notificationsLoading}
      />
    </div>
  );
};

export default Dashboard;
