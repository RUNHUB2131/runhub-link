import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BrandProfile } from "@/types";
import { BrandProfileInputView } from "@/components/profile/BrandProfileInputView";
import { PageContainer } from "@/components/layout/PageContainer";
import { fetchBrandProfile } from "@/utils/profileUtils";

const BrandPersonalInformation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [brandProfile, setBrandProfile] = useState<Partial<BrandProfile>>({});
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
      const profileData = await fetchBrandProfile(user.id);
      if (profileData) {
        setBrandProfile(profileData);
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
      <BrandProfileInputView profile={brandProfile} onProfileUpdate={fetchProfileData} />
    </PageContainer>
  );
};

export default BrandPersonalInformation; 