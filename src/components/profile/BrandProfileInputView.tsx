import { useState } from "react";
import { BrandProfile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { saveBrandBasicInfo, saveBrandSocialMedia } from "@/utils/profileUtils";
import { EditCompanyNameDialog } from "./EditCompanyNameDialog";
import { EditIndustryDialog } from "./EditIndustryDialog";
import { EditBrandDescriptionDialog } from "./EditBrandDescriptionDialog";
import { EditBrandLogoDialog } from "./EditBrandLogoDialog";
import { EditBrandWebsiteDialog } from "./EditBrandWebsiteDialog";
import { EditOpenToPitchesDialog } from "./EditOpenToPitchesDialog";
import { EditBrandSocialMediaDialog } from "./EditBrandSocialMediaDialog";

interface BrandProfileInputViewProps {
  profile: Partial<BrandProfile>;
  onProfileUpdate: () => void;
}

interface ProfileField {
  label: string;
  value: string;
  onEdit: () => void;
}

export const BrandProfileInputView = ({ profile, onProfileUpdate }: BrandProfileInputViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Dialog states
  const [companyNameDialogOpen, setCompanyNameDialogOpen] = useState(false);
  const [industryDialogOpen, setIndustryDialogOpen] = useState(false);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [websiteDialogOpen, setWebsiteDialogOpen] = useState(false);
  const [openToPitchesDialogOpen, setOpenToPitchesDialogOpen] = useState(false);
  const [socialMediaDialogOpen, setSocialMediaDialogOpen] = useState(false);

  const saveProfileData = async (data: Partial<BrandProfile>) => {
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update your profile",
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

  // Helper function to get social media display
  const getSocialMediaDisplay = () => {
    if (!profile.social_media) return "Not specified";
    
    const platforms = [];
    if (profile.social_media.instagram) platforms.push("Instagram");
    if (profile.social_media.facebook) platforms.push("Facebook");
    if (profile.social_media.tiktok) platforms.push("TikTok");
    if (profile.social_media.linkedin) platforms.push("LinkedIn");
    
    return platforms.length > 0 ? platforms.join(", ") : "Not specified";
  };

  // Define profile fields
  const profileFields: ProfileField[] = [
    {
      label: "Company name",
      value: profile.company_name || "Not specified",
      onEdit: () => setCompanyNameDialogOpen(true)
    },
    {
      label: "Industry",
      value: profile.industry || "Not specified",
      onEdit: () => setIndustryDialogOpen(true)
    },
    {
      label: "Description",
      value: profile.description ? 
        `${profile.description.slice(0, 50)}${profile.description.length > 50 ? '...' : ''}` :
        "Not specified",
      onEdit: () => setDescriptionDialogOpen(true)
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
      label: "Social media platforms",
      value: getSocialMediaDisplay(),
      onEdit: () => setSocialMediaDialogOpen(true)
    },
    {
      label: "Open to pitches",
      value: profile.open_to_pitches ? "Yes" : "No",
      onEdit: () => setOpenToPitchesDialogOpen(true)
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with avatar */}
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-20 w-20 mb-4">
          {profile.logo_url ? (
            <AvatarImage src={profile.logo_url} alt="Company logo" />
          ) : (
            <AvatarFallback className="text-2xl font-semibold bg-[#D4A574] text-white">
              {profile.company_name?.charAt(0) || user?.email?.charAt(0) || "B"}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      {/* Title and subtitle */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your profile</h1>
        <p className="text-gray-600">
          Complete profiles help run clubs understand your brand better.
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
      <EditCompanyNameDialog 
        open={companyNameDialogOpen} 
        onOpenChange={setCompanyNameDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditIndustryDialog 
        open={industryDialogOpen} 
        onOpenChange={setIndustryDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditBrandDescriptionDialog 
        open={descriptionDialogOpen} 
        onOpenChange={setDescriptionDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditBrandLogoDialog 
        open={logoDialogOpen} 
        onOpenChange={setLogoDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditBrandWebsiteDialog 
        open={websiteDialogOpen} 
        onOpenChange={setWebsiteDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditOpenToPitchesDialog 
        open={openToPitchesDialogOpen} 
        onOpenChange={setOpenToPitchesDialogOpen} 
        profile={profile}
        onSave={saveProfileData}
      />
      
      <EditBrandSocialMediaDialog 
        open={socialMediaDialogOpen} 
        onOpenChange={setSocialMediaDialogOpen} 
        profile={profile}
        onSave={async (data) => {
          if (!user?.id) {
            toast({
              title: "Authentication error",
              description: "You must be logged in to update your profile",
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
        }}
      />
    </div>
  );
}; 