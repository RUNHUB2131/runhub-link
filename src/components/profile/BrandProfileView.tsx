
import { useState } from "react";
import { BrandProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { EditBrandBasicInfoDialog } from "@/components/profile/EditBrandBasicInfoDialog";
import { EditBrandSocialMediaDialog } from "@/components/profile/EditBrandSocialMediaDialog";
import { saveBrandBasicInfo, saveBrandSocialMedia } from "@/utils/profileUtils";
import { BrandBasicInfoSection } from "@/components/profile/BrandBasicInfoSection";
import { BrandSocialMediaSection } from "@/components/profile/BrandSocialMediaSection";

interface BrandProfileViewProps {
  profile: Partial<BrandProfile>;
  onProfileUpdate: () => void;
}

export const BrandProfileView = ({ profile, onProfileUpdate }: BrandProfileViewProps) => {
  const { toast } = useToast();
  
  // Dialog state
  const [basicInfoDialogOpen, setBasicInfoDialogOpen] = useState(false);
  const [socialMediaDialogOpen, setSocialMediaDialogOpen] = useState(false);
  
  const saveProfileData = async (data: Partial<BrandProfile>) => {
    if (!profile.id) return;
    
    try {
      await saveBrandBasicInfo(profile.id, data);
      
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
    if (!profile.id) return;
    
    try {
      await saveBrandSocialMedia(profile.id, data);
      
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Tell run clubs about your brand
        </p>
      </div>

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
