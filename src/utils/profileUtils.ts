
import { supabase } from "@/integrations/supabase/client";
import { BrandProfile, RunClubProfile, UserType, FollowerCountRange } from "@/types";

export const fetchRunClubProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('run_club_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
    
  if (error) throw error;
  
  if (data) {
    // Transform data to match RunClubProfile type with proper type casting
    const socialMediaData = typeof data.social_media === 'object' && data.social_media !== null
      ? data.social_media as Record<string, any>
      : {};
      
    const communityData = typeof data.community_data === 'object' && data.community_data !== null
      ? data.community_data as Record<string, any>
      : {};
    
    // Validate follower ranges for each platform
    const validRanges: FollowerCountRange[] = ['under_1000', '1000_to_4000', '4000_to_9000', '9000_to_20000', 'over_20000'];
    
    const validateFollowerRange = (range?: string): FollowerCountRange | undefined => {
      return range && validRanges.includes(range as FollowerCountRange) ? range as FollowerCountRange : undefined;
    };
      
    return {
      id: data.id,
      user_id: userId,
      user_type: 'run_club' as UserType,
      created_at: new Date().toISOString(),
      club_name: data.club_name || '',
      description: data.description || '',
      location: data.location || '',
      member_count: data.member_count || 0,
      website: data.website || '',
      logo_url: data.logo_url || '',
      social_media: {
        instagram: socialMediaData.instagram || '',
        instagram_follower_range: validateFollowerRange(socialMediaData.instagram_follower_range),
        facebook: socialMediaData.facebook || '',
        facebook_follower_range: validateFollowerRange(socialMediaData.facebook_follower_range),
        twitter: socialMediaData.twitter || '',
        twitter_follower_range: validateFollowerRange(socialMediaData.twitter_follower_range),
        strava: socialMediaData.strava || '',
        strava_follower_range: validateFollowerRange(socialMediaData.strava_follower_range),
      },
      community_data: {
        run_types: Array.isArray(communityData.run_types) ? communityData.run_types : [],
        demographics: communityData.demographics || {},
      },
    };
  }
  
  return null;
};

export const fetchBrandProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
    
  if (error) throw error;
  
  if (data) {
    // Transform data to match BrandProfile type with proper type casting
    const socialMediaData = typeof data.social_media === 'object' && data.social_media !== null
      ? data.social_media as Record<string, string>
      : {};
      
    return {
      id: data.id,
      user_id: userId,
      user_type: 'brand' as UserType, // Explicitly cast to UserType
      created_at: new Date().toISOString(),
      company_name: data.company_name || '',
      description: data.description || '',
      industry: data.industry || '',
      website: data.website || '',
      logo_url: data.logo_url || '',
      social_media: {
        instagram: socialMediaData.instagram || '',
        facebook: socialMediaData.facebook || '',
        twitter: socialMediaData.twitter || '',
        linkedin: socialMediaData.linkedin || '',
      }
    };
  }
  
  return null;
};

export const saveRunClubBasicInfo = async (userId: string, data: Partial<RunClubProfile>) => {
  const { error } = await supabase
    .from('run_club_profiles')
    .update(data)
    .eq('id', userId);
  
  if (error) throw error;
};

export const saveRunClubSocialMedia = async (userId: string, socialMediaData: Partial<RunClubProfile>) => {
  const { error } = await supabase
    .from('run_club_profiles')
    .update({
      social_media: socialMediaData.social_media
    })
    .eq('id', userId);
  
  if (error) throw error;
};

export const saveRunClubCommunityInfo = async (userId: string, communityData: Partial<RunClubProfile>) => {
  const { error } = await supabase
    .from('run_club_profiles')
    .update({
      community_data: communityData.community_data
    })
    .eq('id', userId);
  
  if (error) throw error;
};
