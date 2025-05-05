import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { RunClubProfile, BrandProfile } from "@/types";
import { BrandProfileForm } from "@/components/profile/BrandProfileForm";
import { RunClubProfileView } from "@/components/profile/RunClubProfileView";
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

  const handleBrandProfileSave = async (formData: Partial<BrandProfile>) => {
    if (!user) return;
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('brand_profiles')
        .update(formData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      fetchProfileData();
      
      toast({
        title: "Profile updated",
        description: "Your brand profile has been updated successfully.",
      });
      
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
      throw error;
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
    return <BrandProfileForm initialData={brandProfile} onSave={handleBrandProfileSave} />;
  }

  return (
    <RunClubProfileView 
      profile={runClubProfile}
      onProfileUpdate={fetchProfileData}
    />
  );
};

export default Profile;
