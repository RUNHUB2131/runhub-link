import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { RunClubProfile } from "@/types";
import { RunClubProfileInputView } from "@/components/profile/RunClubProfileInputView";
import { PageContainer } from "@/components/layout/PageContainer";
import { fetchRunClubProfile } from "@/utils/profileUtils";

const RunClubPersonalInformation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const profileData = await fetchRunClubProfile(user.id);
      if (profileData) {
        setRunClubProfile(profileData);
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

  return (
    <PageContainer>
      <RunClubProfileInputView profile={runClubProfile} onProfileUpdate={fetchProfileData} />
    </PageContainer>
  );
};

export default RunClubPersonalInformation; 