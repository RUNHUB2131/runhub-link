import { useState } from "react";
import { RunClubProfile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { saveRunClubBasicInfo, saveRunClubSocialMedia, saveRunClubCommunityInfo } from "@/utils/profileUtils";
import { EditClubNameDialog } from "./EditClubNameDialog";
import { EditDescriptionDialog } from "./EditDescriptionDialog";
import { EditLocationDialog } from "./EditLocationDialog";
import { EditLogoDialog } from "./EditLogoDialog";
import { EditWebsiteDialog } from "./EditWebsiteDialog";
import { EditMemberCountDialog } from "./EditMemberCountDialog";
import { EditSocialMediaDialog } from "./EditSocialMediaDialog";
import { EditCommunityInfoDialog } from "./EditCommunityInfoDialog";

interface RunClubProfileInputViewProps {
  profile: Partial<RunClubProfile>;
  onProfileUpdate: () => void;
}

interface ProfileField {
  label: string;
  value: string;
  onEdit: () => void;
}

export const RunClubProfileInputView = ({ profile, onProfileUpdate }: RunClubProfileInputViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Dialog states
  const [clubNameDialogOpen, setClubNameDialogOpen] = useState(false);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [websiteDialogOpen, setWebsiteDialogOpen] = useState(false);
  const [memberCountDialogOpen, setMemberCountDialogOpen] = useState(false);
  const [socialMediaDialogOpen, setSocialMediaDialogOpen] = useState(false);
  const [communityInfoDialogOpen, setCommunityInfoDialogOpen] = useState(false);

  const saveProfileData = async (data: Partial<RunClubProfile>) => {
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await saveRunClubBasicInfo(user.id, data);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
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
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await saveRunClubSocialMedia(user.id, data);
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
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await saveRunClubCommunityInfo(user.id, data);
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

  // Helper function to get location display
  const getLocationDisplay = () => {
    if (profile.city && profile.state) {
      return `${profile.city}, ${profile.state}`;
    }
    if (profile.location) {
      return profile.location;
    }
    return "Not specified";
  };

  // Helper function to get social media display
  const getSocialMediaDisplay = () => {
    if (!profile.social_media) return "Not specified";
    
    const platforms = [];
    if (profile.social_media.instagram) {
      const followers = profile.social_media.instagram_follower_range ? 
        ` (${profile.social_media.instagram_follower_range.replace(/_/g, ' ')})` : '';
      platforms.push(`Instagram${followers}`);
    }
    if (profile.social_media.facebook) {
      const followers = profile.social_media.facebook_follower_range ? 
        ` (${profile.social_media.facebook_follower_range.replace(/_/g, ' ')})` : '';
      platforms.push(`Facebook${followers}`);
    }
    if (profile.social_media.tiktok) {
      const followers = profile.social_media.tiktok_follower_range ? 
        ` (${profile.social_media.tiktok_follower_range.replace(/_/g, ' ')})` : '';
      platforms.push(`TikTok${followers}`);
    }
    if (profile.social_media.strava) {
      const followers = profile.social_media.strava_follower_range ? 
        ` (${profile.social_media.strava_follower_range.replace(/_/g, ' ')})` : '';
      platforms.push(`Strava${followers}`);
    }
    
    return platforms.length > 0 ? platforms.join(", ") : "Not specified";
  };

  // Helper function to get run types display
  const getRunTypesDisplay = () => {
    if (!profile.community_data?.run_types || profile.community_data.run_types.length === 0) {
      return "Not specified";
    }
    return profile.community_data.run_types.join(", ");
  };

  // Helper function to get demographics display
  const getDemographicsDisplay = () => {
    if (!profile.community_data?.demographics) return "Not specified";
    
    const demo = profile.community_data.demographics;
    const parts = [];
    if (demo.average_group_size) parts.push(`Group size: ${demo.average_group_size}`);
    if (demo.core_demographic) parts.push(`Age: ${demo.core_demographic}`);
    if (demo.average_pace) parts.push(`Pace: ${demo.average_pace}`);
    
    return parts.length > 0 ? parts.join(", ") : "Not specified";
  };

  // Helper function to get event experience display
  const getEventExperienceDisplay = () => {
    if (!profile.community_data?.demographics?.event_experience || 
        profile.community_data.demographics.event_experience.length === 0) {
      return "Not specified";
    }
    return profile.community_data.demographics.event_experience.join(", ");
  };

  // Define profile fields
  const profileFields: ProfileField[] = [
    {
      label: "Club name",
      value: profile.club_name || "Not specified",
      onEdit: () => setClubNameDialogOpen(true)
    },
    {
      label: "Description",
      value: profile.description || "Not specified",
      onEdit: () => setDescriptionDialogOpen(true)
    },
    {
      label: "Location",
      value: getLocationDisplay(),
      onEdit: () => setLocationDialogOpen(true)
    },
    {
      label: "Logo",
      value: profile.logo_url ? "Uploaded" : "Not uploaded",
      onEdit: () => setLogoDialogOpen(true)
    },
    {
      label: "Website",
      value: profile.website || "Not specified",
      onEdit: () => setWebsiteDialogOpen(true)
    },
    {
      label: "Member count",
      value: profile.member_count ? profile.member_count.toString() : "Not specified",
      onEdit: () => setMemberCountDialogOpen(true)
    },
    {
      label: "Demographics",
      value: getDemographicsDisplay(),
      onEdit: () => setCommunityInfoDialogOpen(true)
    },
    {
      label: "Run types",
      value: getRunTypesDisplay(),
      onEdit: () => setCommunityInfoDialogOpen(true)
    },
    {
      label: "Event experience",
      value: getEventExperienceDisplay(),
      onEdit: () => setCommunityInfoDialogOpen(true)
    },
    {
      label: "Social media & followers",
      value: getSocialMediaDisplay(),
      onEdit: () => setSocialMediaDialogOpen(true)
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with avatar */}
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-20 w-20 mb-4">
          {profile.logo_url ? (
            <AvatarImage src={profile.logo_url} alt="Club logo" />
          ) : (
            <AvatarFallback className="text-2xl font-semibold bg-[#D4A574] text-white">
              {profile.club_name?.charAt(0) || user?.email?.charAt(0) || "R"}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      {/* Title and subtitle */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your profile</h1>
        <p className="text-gray-600">
          Complete profiles have 4x the chance of being selected for opportunities.
        </p>
      </div>

      {/* Profile fields */}
      <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
        {profileFields.map((field, index) => (
          <button
            key={field.label}
            onClick={field.onEdit}
            className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${
              index !== profileFields.length - 1 ? 'border-b border-gray-200' : ''
            }`}
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-1">{field.label}</div>
              <div className="text-gray-600 text-sm">{field.value}</div>
            </div>
            <div className="text-[#D4A574] font-medium text-sm underline">
              Edit
            </div>
          </button>
        ))}
      </div>

      {/* Edit dialogs */}
      <EditClubNameDialog 
        open={clubNameDialogOpen} 
        onOpenChange={setClubNameDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditDescriptionDialog 
        open={descriptionDialogOpen} 
        onOpenChange={setDescriptionDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditLocationDialog 
        open={locationDialogOpen} 
        onOpenChange={setLocationDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditLogoDialog 
        open={logoDialogOpen} 
        onOpenChange={setLogoDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditWebsiteDialog 
        open={websiteDialogOpen} 
        onOpenChange={setWebsiteDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditMemberCountDialog 
        open={memberCountDialogOpen} 
        onOpenChange={setMemberCountDialogOpen} 
        profile={profile}
        onSave={saveCommunityInfo}
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