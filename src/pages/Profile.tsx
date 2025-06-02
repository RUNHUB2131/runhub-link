import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { RunClubProfile, BrandProfile } from "@/types";
import { BrandProfileView } from "@/components/profile/BrandProfileView";
import { RunClubProfileView } from "@/components/profile/RunClubProfileView";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchRunClubProfile, fetchBrandProfile } from "@/utils/profileUtils";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { userType, user } = useAuth();
  const { toast } = useToast();
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});
  const [brandProfile, setBrandProfile] = useState<Partial<BrandProfile>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user, userType]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      if (userType === 'run_club') {
        const profileData = await fetchRunClubProfile(user.id);
        if (profileData) {
          setRunClubProfile(profileData);
        }
      } else if (userType === 'brand') {
        const profileData = await fetchBrandProfile(user.id);
        if (profileData) {
          setBrandProfile(profileData);
        }
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </PageContainer>
    );
  }

  const headerDescription = userType === 'brand' 
    ? "Tell run clubs about your company"
    : "Tell brands about your run club";

  return (
    <PageContainer>
      <PageHeader 
        title="My Profile" 
        description={headerDescription}
      />
      
      {userType === 'brand' ? (
        <BrandProfileView profile={brandProfile} onProfileUpdate={fetchProfileData} />
      ) : (
        <RunClubProfileView 
          profile={runClubProfile}
          onProfileUpdate={fetchProfileData}
        />
      )}
    </PageContainer>
  );
};

export default Profile;
