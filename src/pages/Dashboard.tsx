import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivitySection } from "@/components/dashboard/RecentActivitySection";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { RunClubProfile } from "@/types";
import { fetchRunClubProfile } from "@/utils/profileUtils";

const Dashboard = () => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const { isLoading, stats, recentActivity } = useDashboardData();
  const [profilePercentage, setProfilePercentage] = useState<number>(0);
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <StatsCards userType={userType} stats={stats} isLoading={isLoading} />
          </div>
          
          {userType === 'run_club' && (
            <ProfileCompletionCard 
              isLoading={profileLoading} 
              percentage={profilePercentage}
              profile={runClubProfile} 
            />
          )}
        </div>
        
        <RecentActivitySection 
          notifications={recentActivity} 
          isLoading={isLoading} 
          notificationsLoading={notificationsLoading} 
        />
      </div>
    </PageContainer>
  );
};

export default Dashboard;
