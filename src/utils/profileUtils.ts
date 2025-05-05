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

export const saveRunClubBasicInfo = async (profileId: string, data: Partial<RunClubProfile>) => {
  const { error } = await supabase
    .from('run_club_profiles')
    .update({
      club_name: data.club_name,
      description: data.description,
      location: data.location,
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
  const { error } = await supabase
    .from('run_club_profiles')
    .update({
      community_data: data.community_data,
    })
    .eq('id', profileId);

  if (error) throw error;
};

// Helper functions for Brand Profile
export const saveBrandBasicInfo = async (profileId: string, data: Partial<BrandProfile>) => {
  const { error } = await supabase
    .from('brand_profiles')
    .update({
      company_name: data.company_name,
      industry: data.industry,
      description: data.description,
      website: data.website,
      logo_url: data.logo_url,
    })
    .eq('id', profileId);

  if (error) throw error;
};

export const saveBrandSocialMedia = async (profileId: string, data: Partial<BrandProfile>) => {
  const { error } = await supabase
    .from('brand_profiles')
    .update({
      social_media: data.social_media,
    })
    .eq('id', profileId);

  if (error) throw error;
};
