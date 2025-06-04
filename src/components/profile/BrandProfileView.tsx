import { useState } from "react";
import { BrandProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useDialogState } from "@/hooks/usePageVisibility";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { EditBrandBasicInfoDialog } from "@/components/profile/EditBrandBasicInfoDialog";
import { EditBrandSocialMediaDialog } from "@/components/profile/EditBrandSocialMediaDialog";
import { saveBrandBasicInfo, saveBrandSocialMedia } from "@/utils/profileUtils";
import { BrandBasicInfoSection } from "@/components/profile/BrandBasicInfoSection";
import { BrandSocialMediaSection } from "@/components/profile/BrandSocialMediaSection";
import { useAuth } from "@/contexts/AuthContext";

interface BrandProfileViewProps {
  profile: Partial<BrandProfile>;
  onProfileUpdate: () => void;
}

export const BrandProfileView = ({ profile, onProfileUpdate }: BrandProfileViewProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Dialog state - persisted across page reloads
  const [basicInfoDialogOpen, setBasicInfoDialogOpen] = useDialogState('brand-basic-info');
  const [socialMediaDialogOpen, setSocialMediaDialogOpen] = useDialogState('brand-social-media');
  
  const saveProfileData = async (data: Partial<BrandProfile>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await saveBrandBasicInfo(user.id, data);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      // Refresh profile data
      onProfileUpdate();
      
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  const saveSocialMedia = async (data: Partial<BrandProfile>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await saveBrandSocialMedia(user.id, data);
      
      toast({
        title: "Success",
        description: "Social media updated successfully",
      });
      
      onProfileUpdate();
      
    } catch (error: any) {
      console.error("Error saving social media:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save social media",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <ProfileSection 
        title="Basic Information" 
        subtitle="Your brand's essential details"
        onEdit={() => setBasicInfoDialogOpen(true)}
      >
        <BrandBasicInfoSection profile={profile} />
      </ProfileSection>
      
      <ProfileSection 
        title="Social Media" 
        subtitle="Connect your social accounts"
        onEdit={() => setSocialMediaDialogOpen(true)}
      >
        <BrandSocialMediaSection profile={profile} />
      </ProfileSection>

      {/* Edit dialogs */}
      <EditBrandBasicInfoDialog 
        open={basicInfoDialogOpen} 
        onOpenChange={setBasicInfoDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditBrandSocialMediaDialog 
        open={socialMediaDialogOpen} 
        onOpenChange={setSocialMediaDialogOpen} 
        profile={profile}
        onSave={saveSocialMedia}
      />
    </div>
  );
};
