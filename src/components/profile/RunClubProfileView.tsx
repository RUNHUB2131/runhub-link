import { useState } from "react";
import { RunClubProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useDialogState } from "@/hooks/usePageVisibility";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { BasicInfoSection } from "@/components/profile/BasicInfoSection";
import { SocialMediaSection } from "@/components/profile/SocialMediaSection";
import { CommunityInfoSection } from "@/components/profile/CommunityInfoSection";
import { EditBasicInfoDialog } from "@/components/profile/EditBasicInfoDialog";
import { EditSocialMediaDialog } from "@/components/profile/EditSocialMediaDialog";
import { EditCommunityInfoDialog } from "@/components/profile/EditCommunityInfoDialog";
import { saveRunClubBasicInfo, saveRunClubSocialMedia, saveRunClubCommunityInfo } from "@/utils/profileUtils";

interface RunClubProfileViewProps {
  profile: Partial<RunClubProfile>;
  onProfileUpdate: () => void;
}

export const RunClubProfileView = ({ profile, onProfileUpdate }: RunClubProfileViewProps) => {
  const { toast } = useToast();
  
  // Dialog state - persisted across page reloads
  const [basicInfoDialogOpen, setBasicInfoDialogOpen] = useDialogState('runclub-basic-info');
  const [socialMediaDialogOpen, setSocialMediaDialogOpen] = useDialogState('runclub-social-media');
  const [communityInfoDialogOpen, setCommunityInfoDialogOpen] = useDialogState('runclub-community-info');
  
  const saveProfileData = async (data: Partial<RunClubProfile>) => {
    if (!profile.id) return;
    
    try {
      await saveRunClubBasicInfo(profile.id, data);
      
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

  const saveSocialMedia = async (data: Partial<RunClubProfile>) => {
    if (!profile.id) return;
    
    try {
      await saveRunClubSocialMedia(profile.id, data);
      
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

  const saveCommunityInfo = async (data: Partial<RunClubProfile>) => {
    if (!profile.id) return;
    
    try {
      await saveRunClubCommunityInfo(profile.id, data);
      
      toast({
        title: "Success",
        description: "Community information updated successfully",
      });
      
      onProfileUpdate();
      
    } catch (error: any) {
      console.error("Error saving community info:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save community information",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <ProfileSection 
        title="Basic Information" 
        subtitle="Your run club's essential details"
        onEdit={() => setBasicInfoDialogOpen(true)}
      >
        <BasicInfoSection profile={profile} />
      </ProfileSection>
      
      <ProfileSection 
        title="Community Information" 
        subtitle="Share details about your community demographics"
        onEdit={() => setCommunityInfoDialogOpen(true)}
      >
        <CommunityInfoSection profile={profile} />
      </ProfileSection>
      
      <ProfileSection 
        title="Social Media" 
        subtitle="Connect your social accounts and share your following"
        onEdit={() => setSocialMediaDialogOpen(true)}
      >
        <SocialMediaSection profile={profile} />
      </ProfileSection>

      {/* Edit dialogs */}
      <EditBasicInfoDialog 
        open={basicInfoDialogOpen} 
        onOpenChange={setBasicInfoDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditSocialMediaDialog 
        open={socialMediaDialogOpen} 
        onOpenChange={setSocialMediaDialogOpen} 
        profile={profile}
        onSave={saveSocialMedia}
      />
      
      <EditCommunityInfoDialog 
        open={communityInfoDialogOpen} 
        onOpenChange={setCommunityInfoDialogOpen} 
        profile={profile}
        onSave={saveCommunityInfo}
      />
    </div>
  );
};
