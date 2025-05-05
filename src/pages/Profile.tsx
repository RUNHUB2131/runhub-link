
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { RunClubProfile, BrandProfile } from "@/types";
import { BrandProfileForm } from "@/components/profile/BrandProfileForm";
import { RunClubProfileView } from "@/components/profile/RunClubProfileView";
import { fetchRunClubProfile, fetchBrandProfile } from "@/utils/profileUtils";

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
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (userType === 'brand') {
    return <BrandProfileForm initialData={brandProfile} />;
  }

  return (
    <RunClubProfileView 
      profile={runClubProfile}
      onProfileUpdate={fetchProfileData}
    />
  );
};

export default Profile;
