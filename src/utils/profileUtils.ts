import { RunClubProfile, BrandProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchRunClubProfile = async (userId: string): Promise<Partial<RunClubProfile> | null> => {
  try {
    const { data, error } = await supabase
      .from('run_club_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching run club profile:", error);
      return null;
    }

    return data as RunClubProfile;
  } catch (error: any) {
    console.error("Error fetching run club profile:", error);
    return null;
  }
};

export const fetchBrandProfile = async (userId: string): Promise<Partial<BrandProfile> | null> => {
  try {
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching brand profile:", error);
      return null;
    }

    return data as BrandProfile;
  } catch (error: any) {
    console.error("Error fetching brand profile:", error);
    return null;
  }
};

export const ensureUserProfile = async (userId: string, userType: 'brand' | 'run_club'): Promise<boolean> => {
  try {
    console.log(`Ensuring profile exists for user ${userId} with type ${userType}`);
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing profile:', checkError);
      throw checkError;
    }

    if (existingProfile) {
      console.log('Profile exists:', existingProfile);
      return existingProfile.user_type === userType;
    }

    // Profile doesn't exist, create it
    console.log('Creating missing profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        user_type: userType
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw profileError;
    }

    // Also create the specific profile type
    if (userType === 'brand') {
      const { error: brandError } = await supabase
        .from('brand_profiles')
        .insert({
          id: userId,
          company_name: 'Your Company Name'
        });

      if (brandError && !brandError.message?.includes('duplicate key value')) {
        console.error('Error creating brand profile:', brandError);
        throw brandError;
      }
    } else if (userType === 'run_club') {
      const { error: clubError } = await supabase
        .from('run_club_profiles')
        .insert({
          id: userId,
          club_name: 'Your Club Name'
        });

      if (clubError && !clubError.message?.includes('duplicate key value')) {
        console.error('Error creating run club profile:', clubError);
        throw clubError;
      }
    }

    console.log('Profile created successfully');
    return true;
  } catch (error: any) {
    console.error('Error ensuring user profile:', error);
    return false;
  }
};

export const saveRunClubBasicInfo = async (profileId: string, data: Partial<RunClubProfile>) => {
  const { error } = await supabase
    .from('run_club_profiles')
    .update({
      club_name: data.club_name,
      description: data.description,
      city: data.city,
      state: data.state,
      website: data.website,
      logo_url: data.logo_url,
      member_count: data.member_count,
    })
    .eq('id', profileId);

  if (error) throw error;
};

export const saveRunClubSocialMedia = async (profileId: string, data: Partial<RunClubProfile>) => {
  const { error } = await supabase
    .from('run_club_profiles')
    .update({
      social_media: data.social_media,
    })
    .eq('id', profileId);

  if (error) throw error;
};

export const saveRunClubCommunityInfo = async (profileId: string, data: Partial<RunClubProfile>) => {
  console.log("Saving community info with member count:", data.member_count);
  
  const { error } = await supabase
    .from('run_club_profiles')
    .update({
      member_count: data.member_count,
      community_data: data.community_data,
    })
    .eq('id', profileId);

  if (error) throw error;
};

// Helper functions for Brand Profile
export const saveBrandBasicInfo = async (userId: string, data: Partial<BrandProfile>) => {
  const { error } = await supabase
    .from('brand_profiles')
    .update(data)
    .eq('id', userId);

  if (error) throw error;
};

export const saveBrandSocialMedia = async (userId: string, data: Partial<BrandProfile>) => {
  const { error } = await supabase
    .from('brand_profiles')
    .update({ social_media: data.social_media })
    .eq('id', userId);

  if (error) throw error;
};
