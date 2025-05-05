
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RunClubProfile, BrandProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { BrandProfileForm } from "@/components/profile/BrandProfileForm";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { BasicInfoSection } from "@/components/profile/BasicInfoSection";
import { SocialMediaSection } from "@/components/profile/SocialMediaSection";
import { CommunityInfoSection } from "@/components/profile/CommunityInfoSection";
import { EditBasicInfoDialog } from "@/components/profile/EditBasicInfoDialog";
import { EditSocialMediaDialog } from "@/components/profile/EditSocialMediaDialog";
import { EditCommunityInfoDialog } from "@/components/profile/EditCommunityInfoDialog";

const Profile = () => {
  const { userType, user } = useAuth();
  const { toast } = useToast();
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});
  const [brandProfile, setBrandProfile] = useState<Partial<BrandProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state
  const [basicInfoDialogOpen, setBasicInfoDialogOpen] = useState(false);
  const [socialMediaDialogOpen, setSocialMediaDialogOpen] = useState(false);
  const [communityInfoDialogOpen, setCommunityInfoDialogOpen] = useState(false);

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
        const { data, error } = await supabase
          .from('run_club_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          // Transform data to match RunClubProfile type with proper type casting
          const socialMediaData = typeof data.social_media === 'object' && data.social_media !== null
            ? data.social_media as Record<string, string>
            : {};
            
          const communityData = typeof data.community_data === 'object' && data.community_data !== null
            ? data.community_data as Record<string, any>
            : {};
            
          setRunClubProfile({
            id: data.id,
            user_id: user.id,
            user_type: 'run_club',
            created_at: new Date().toISOString(),
            club_name: data.club_name || '',
            description: data.description || '',
            location: data.location || '',
            member_count: data.member_count || 0,
            website: data.website || '',
            logo_url: data.logo_url || '',
            social_media: {
              instagram: socialMediaData.instagram || '',
              facebook: socialMediaData.facebook || '',
              twitter: socialMediaData.twitter || '',
              strava: socialMediaData.strava || '',
            },
            community_data: {
              run_types: Array.isArray(communityData.run_types) ? communityData.run_types : [],
              demographics: communityData.demographics || {},
            },
          });
        }
      } else if (userType === 'brand') {
        const { data, error } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          // Transform data to match BrandProfile type
          setBrandProfile(data);
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

  const saveProfileData = async (data: Partial<RunClubProfile>) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('run_club_profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      // Refresh profile data
      fetchProfileData();
      
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
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('run_club_profiles')
        .update({
          social_media: data.social_media
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Social media updated successfully",
      });
      
      fetchProfileData();
      
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
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('run_club_profiles')
        .update({
          community_data: data.community_data
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Community information updated successfully",
      });
      
      fetchProfileData();
      
    } catch (error: any) {
      console.error("Error saving community info:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save community information",
        variant: "destructive",
      });
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Tell brands about your run club
        </p>
      </div>

      <ProfileSection 
        title="Basic Information" 
        subtitle="Your run club's essential details"
        onEdit={() => setBasicInfoDialogOpen(true)}
      >
        <BasicInfoSection profile={runClubProfile} />
      </ProfileSection>
      
      <ProfileSection 
        title="Community Information" 
        subtitle="Share details about your community demographics"
        onEdit={() => setCommunityInfoDialogOpen(true)}
      >
        <CommunityInfoSection profile={runClubProfile} />
      </ProfileSection>
      
      <ProfileSection 
        title="Social Media" 
        subtitle="Connect your social accounts and share your following"
        onEdit={() => setSocialMediaDialogOpen(true)}
      >
        <SocialMediaSection profile={runClubProfile} />
      </ProfileSection>

      {/* Edit dialogs */}
      <EditBasicInfoDialog 
        open={basicInfoDialogOpen} 
        onOpenChange={setBasicInfoDialogOpen} 
        profile={runClubProfile}
        onSave={saveProfileData}
      />
      
      <EditSocialMediaDialog 
        open={socialMediaDialogOpen} 
        onOpenChange={setSocialMediaDialogOpen} 
        profile={runClubProfile}
        onSave={saveSocialMedia}
      />
      
      <EditCommunityInfoDialog 
        open={communityInfoDialogOpen} 
        onOpenChange={setCommunityInfoDialogOpen} 
        profile={runClubProfile}
        onSave={saveCommunityInfo}
      />
    </div>
  );
};

export default Profile;
