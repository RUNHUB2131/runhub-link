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
          
          // Calculate profile completion percentage
          let completedFields = 0;
          let totalFields = 0;
          
          // Basic fields
          const basicFields = ['club_name', 'description', 'location', 'member_count', 'website', 'logo_url'];
          basicFields.forEach(field => {
            totalFields++;
            if (profileData[field as keyof RunClubProfile]) completedFields++;
          });
          
          // Social media
          if (profileData.social_media) {
            const socialMediaFields = ['instagram', 'facebook', 'tiktok', 'strava'];
            socialMediaFields.forEach(platform => {
              totalFields++;
              if (profileData.social_media?.[platform as keyof typeof profileData.social_media]) completedFields++;
            });
          }
          
          // Community data
          if (profileData.community_data) {
            totalFields += 3; // run types, demographics, and events
            if (profileData.community_data.run_types && profileData.community_data.run_types.length > 0) completedFields++;
            if (profileData.community_data.demographics && Object.keys(profileData.community_data.demographics).length > 0) completedFields++;
          }
          
          const percentage = Math.round((completedFields / totalFields) * 100);
          setProfilePercentage(percentage);
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
