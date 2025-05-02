
import { useEffect, useState } from "react";
import { RunClubProfileForm } from "@/components/profile/RunClubProfileForm";
import { BrandProfileForm } from "@/components/profile/BrandProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RunClubProfile, BrandProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";

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
        const { data, error } = await supabase
          .from('run_club_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          // Transform data to match RunClubProfile type
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
            social_media: data.social_media ? {
              instagram: data.social_media.instagram as string || '',
              facebook: data.social_media.facebook as string || '',
              twitter: data.social_media.twitter as string || '',
              strava: data.social_media.strava as string || '',
            } : {},
            community_data: data.community_data ? {
              run_types: data.community_data.run_types as string[] || [],
              demographics: data.community_data.demographics || {},
            } : {},
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
          setBrandProfile({
            id: data.id,
            user_id: user.id,
            user_type: 'brand',
            created_at: new Date().toISOString(),
            company_name: data.company_name || '',
            industry: data.industry || '',
            description: data.description || '',
            website: data.website || '',
            logo_url: data.logo_url || '',
            social_media: data.social_media ? {
              instagram: data.social_media.instagram as string || '',
              facebook: data.social_media.facebook as string || '',
              twitter: data.social_media.twitter as string || '',
              linkedin: data.social_media.linkedin as string || '',
            } : {},
          });
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

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          {userType === 'run_club' 
            ? 'Tell brands about your run club' 
            : 'Tell running clubs about your brand'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : userType === 'run_club' ? (
        <RunClubProfileForm initialData={runClubProfile} />
      ) : (
        <BrandProfileForm initialData={brandProfile} />
      )}
    </div>
  );
};

export default Profile;
