import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useNotifications } from "@/hooks/useNotifications";
import { useTotalViews } from "@/hooks/useTotalViews";
import { useTotalApplications, ApplicationsPeriod } from "@/hooks/useTotalApplications";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards, ViewsPeriod } from "@/components/dashboard/StatsCards";
import { RecentActivitySection } from "@/components/dashboard/RecentActivitySection";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { RunClubProfile } from "@/types";
import { fetchRunClubProfile } from "@/utils/profileUtils";
import { isProfileComplete, getMissingProfileFields } from "@/utils/profileCompletionUtils";

const Dashboard = () => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [viewsPeriod, setViewsPeriod] = useState<ViewsPeriod>('all');
  const [applicationsPeriod, setApplicationsPeriod] = useState<ApplicationsPeriod>('all');
  const { isLoading, stats } = useDashboardData();
  const { notifications, isLoading: notificationsLoading, markAsRead } = useNotifications();
  const { totalViews, isLoading: totalViewsLoading } = useTotalViews(viewsPeriod);
  const { totalApplications, isLoading: totalApplicationsLoading } = useTotalApplications(applicationsPeriod);
  const [profilePercentage, setProfilePercentage] = useState<number>(0);
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});
  const [profileLoading, setProfileLoading] = useState(true);

  const handleViewsPeriodChange = (period: ViewsPeriod) => {
    setViewsPeriod(period);
  };

  const handleApplicationsPeriodChange = (period: ApplicationsPeriod) => {
    setApplicationsPeriod(period);
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id || userType !== 'run_club') return;
      
      try {
        setProfileLoading(true);
        const profileData = await fetchRunClubProfile(user.id);
        
        if (profileData) {
          setRunClubProfile(profileData);
          
          // Use the same profile completion logic as the rest of the app
          if (isProfileComplete(profileData)) {
            setProfilePercentage(100);
          } else {
            // Calculate percentage based on completed vs missing required fields
            const missingFields = getMissingProfileFields(profileData);
            
            // Total required categories for completion
            const totalRequiredCategories = 5; // club_name, location, member_count, description, (social_media OR run_types)
            const completedCategories = totalRequiredCategories - missingFields.length;
            
            const percentage = Math.round((completedCategories / totalRequiredCategories) * 100);
            setProfilePercentage(Math.max(0, percentage));
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setProfileLoading(false);
      }
    };
    
    loadProfileData();
  }, [user?.id, userType, toast]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <DashboardHeader userType={userType} />
        
        {userType === 'run_club' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <StatsCards 
                userType={userType} 
                stats={stats} 
                isLoading={isLoading} 
                totalViews={totalViews}
                totalViewsLoading={totalViewsLoading}
                onViewsPeriodChange={handleViewsPeriodChange}
                totalApplications={totalApplications}
                totalApplicationsLoading={totalApplicationsLoading}
                onApplicationsPeriodChange={handleApplicationsPeriodChange}
              />
            </div>
            
            <ProfileCompletionCard 
              isLoading={profileLoading} 
              percentage={profilePercentage}
              profile={runClubProfile} 
            />
          </div>
        ) : (
          <StatsCards 
            userType={userType} 
            stats={stats} 
            isLoading={isLoading} 
            totalViews={totalViews}
            totalViewsLoading={totalViewsLoading}
            onViewsPeriodChange={handleViewsPeriodChange}
            totalApplications={totalApplications}
            totalApplicationsLoading={totalApplicationsLoading}
            onApplicationsPeriodChange={handleApplicationsPeriodChange}
          />
        )}
        
        <RecentActivitySection 
          notifications={notifications} 
          isLoading={isLoading} 
          notificationsLoading={notificationsLoading}
          markAsRead={markAsRead}
        />
      </div>
    </PageContainer>
  );
};

export default Dashboard;
