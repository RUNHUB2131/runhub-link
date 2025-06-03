import { RunClubProfile, BrandProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchRunClubProfile = async (userId: string): Promise<Partial<RunClubProfile> | null> => {
  try {
    const { data, error } = await supabase
      .from('run_club_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching run club profile:", error);
      // Return a basic profile object so the user can still edit
      return { id: userId };
    }

    // If no profile exists yet, return a basic profile object
    if (!data) {
      console.log("No run club profile found, returning empty profile for user:", userId);
      return { id: userId };
    }

    return data as RunClubProfile;
  } catch (error: any) {
    console.error("Error fetching run club profile:", error);
    // Return a basic profile object so the user can still edit
    return { id: userId };
  }
};

export const fetchBrandProfile = async (userId: string): Promise<Partial<BrandProfile> | null> => {
  try {
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching brand profile:", error);
      // Return a basic profile object so the user can still edit
      return { id: userId };
    }

    // If no profile exists yet, return a basic profile object
    if (!data) {
      console.log("No brand profile found, returning empty profile for user:", userId);
      return { id: userId };
    }

    return data as BrandProfile;
  } catch (error: any) {
    console.error("Error fetching brand profile:", error);
    // Return a basic profile object so the user can still edit
    return { id: userId };
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
  // First ensure the base profile exists
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', profileId)
    .maybeSingle();

  if (profileCheckError) {
    console.error('Error checking profile:', profileCheckError);
    throw new Error('Failed to check user profile');
  }

  // If no base profile exists, create it
  if (!existingProfile) {
    console.log('Creating base profile for user:', profileId);
    const { error: profileCreateError } = await supabase
      .from('profiles')
      .insert({
        id: profileId,
        user_type: 'run_club'
      });

    if (profileCreateError) {
      console.error('Error creating base profile:', profileCreateError);
      throw new Error('Failed to create base profile');
    }
  }

  // Now upsert the run club profile
  const { error } = await supabase
    .from('run_club_profiles')
    .upsert({
      id: profileId,
      club_name: data.club_name,
      description: data.description,
      city: data.city,
      state: data.state,
      website: data.website,
      logo_url: data.logo_url,
      member_count: data.member_count,
    }, {
      onConflict: 'id'
    });

  if (error) throw error;
};

export const saveRunClubSocialMedia = async (profileId: string, data: Partial<RunClubProfile>) => {
  // First ensure the base profile exists
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', profileId)
    .maybeSingle();

  if (profileCheckError) {
    console.error('Error checking profile:', profileCheckError);
    throw new Error('Failed to check user profile');
  }

  // If no base profile exists, create it
  if (!existingProfile) {
    console.log('Creating base profile for user:', profileId);
    const { error: profileCreateError } = await supabase
      .from('profiles')
      .insert({
        id: profileId,
        user_type: 'run_club'
      });

    if (profileCreateError) {
      console.error('Error creating base profile:', profileCreateError);
      throw new Error('Failed to create base profile');
    }
  }

  // Now upsert the run club profile
  const { error } = await supabase
    .from('run_club_profiles')
    .upsert({
      id: profileId,
      social_media: data.social_media,
    }, {
      onConflict: 'id'
    });

  if (error) throw error;
};

export const saveRunClubCommunityInfo = async (profileId: string, data: Partial<RunClubProfile>) => {
  console.log("Saving community info with member count:", data.member_count);
  
  // First ensure the base profile exists
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', profileId)
    .maybeSingle();

  if (profileCheckError) {
    console.error('Error checking profile:', profileCheckError);
    throw new Error('Failed to check user profile');
  }

  // If no base profile exists, create it
  if (!existingProfile) {
    console.log('Creating base profile for user:', profileId);
    const { error: profileCreateError } = await supabase
      .from('profiles')
      .insert({
        id: profileId,
        user_type: 'run_club'
      });

    if (profileCreateError) {
      console.error('Error creating base profile:', profileCreateError);
      throw new Error('Failed to create base profile');
    }
  }

  // Now upsert the run club profile
  const { error } = await supabase
    .from('run_club_profiles')
    .upsert({
      id: profileId,
      member_count: data.member_count,
      community_data: data.community_data,
    }, {
      onConflict: 'id'
    });

  if (error) throw error;
};

// Helper functions for Brand Profile
export const saveBrandBasicInfo = async (userId: string, data: Partial<BrandProfile>) => {
  // First ensure the base profile exists
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', userId)
    .maybeSingle();

  if (profileCheckError) {
    console.error('Error checking profile:', profileCheckError);
    throw new Error('Failed to check user profile');
  }

  // If no base profile exists, create it
  if (!existingProfile) {
    console.log('Creating base profile for user:', userId);
    const { error: profileCreateError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        user_type: 'brand'
      });

    if (profileCreateError) {
      console.error('Error creating base profile:', profileCreateError);
      throw new Error('Failed to create base profile');
    }
  }

  // Now upsert the brand profile
  const { error } = await supabase
    .from('brand_profiles')
    .upsert({
      id: userId,
      ...data
    }, {
      onConflict: 'id'
    });

  if (error) throw error;
};

export const saveBrandSocialMedia = async (userId: string, data: Partial<BrandProfile>) => {
  // First ensure the base profile exists
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', userId)
    .maybeSingle();

  if (profileCheckError) {
    console.error('Error checking profile:', profileCheckError);
    throw new Error('Failed to check user profile');
  }

  // If no base profile exists, create it
  if (!existingProfile) {
    console.log('Creating base profile for user:', userId);
    const { error: profileCreateError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        user_type: 'brand'
      });

    if (profileCreateError) {
      console.error('Error creating base profile:', profileCreateError);
      throw new Error('Failed to create base profile');
    }
  }

  // Now upsert the brand profile
  const { error } = await supabase
    .from('brand_profiles')
    .upsert({
      id: userId,
      social_media: data.social_media
    }, {
      onConflict: 'id'
    });

  if (error) throw error;
};
