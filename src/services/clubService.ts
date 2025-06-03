import { supabase } from "@/integrations/supabase/client";
import { RunClubProfile, FollowerCountRange } from "@/types";

export interface ClubFilters {
  state?: string;
  minMemberCount?: number;
  maxMemberCount?: number;
  followerRange?: FollowerCountRange;
  searchText?: string;
  showFavoritesOnly?: boolean;
}

export interface ClubsResponse {
  data: RunClubProfile[];
  count: number;
}

// Mapping follower ranges to numerical values for filtering
const FOLLOWER_RANGE_VALUES = {
  'under_1000': { min: 0, max: 999 },
  '1000_to_4000': { min: 1000, max: 4000 },
  '4000_to_9000': { min: 4000, max: 9000 },
  '9000_to_20000': { min: 9000, max: 20000 },
  'over_20000': { min: 20000, max: Infinity }
};

export const fetchAllClubs = async (
  filters: ClubFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<ClubsResponse> => {
  try {
    let query = supabase
      .from('run_club_profiles')
      .select('*', { count: 'exact' });

    // Apply state filter
    if (filters.state) {
      query = query.eq('state', filters.state);
    }

    // Apply member count filters
    if (filters.minMemberCount !== undefined) {
      query = query.gte('member_count', filters.minMemberCount);
    }
    if (filters.maxMemberCount !== undefined) {
      query = query.lte('member_count', filters.maxMemberCount);
    }

    // Apply text search (club_name or city)
    if (filters.searchText) {
      const searchTerm = filters.searchText.trim();
      if (searchTerm) {
        query = query.or(`club_name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by club name for consistent results
    query = query.order('club_name', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching clubs:", error);
      throw error;
    }

    let filteredData = data || [];

    // Apply follower range filter (client-side since it's nested JSON)
    if (filters.followerRange && filteredData.length > 0) {
      const range = FOLLOWER_RANGE_VALUES[filters.followerRange];
      filteredData = filteredData.filter(club => {
        if (!club.social_media) return false;
        
        // Check all social media platforms for follower counts in the specified range
        const socialMedia = club.social_media as any;
        const instagramRange = socialMedia.instagram_follower_range;
        const facebookRange = socialMedia.facebook_follower_range;
        const tiktokRange = socialMedia.tiktok_follower_range;
        const stravaRange = socialMedia.strava_follower_range;
        
        const hasMatchingRange = [instagramRange, facebookRange, tiktokRange, stravaRange]
          .some(platformRange => platformRange === filters.followerRange);
        
        return hasMatchingRange;
      });
    }

    return {
      data: filteredData as RunClubProfile[],
      count: count || 0
    };
  } catch (error) {
    console.error("Error in fetchAllClubs:", error);
    throw error;
  }
};

export const getAvailableStates = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('run_club_profiles')
      .select('state')
      .not('state', 'is', null)
      .order('state');

    if (error) {
      throw error;
    }

    // Get unique states
    const states = [...new Set(data?.map(item => item.state).filter(Boolean))] as string[];
    return states;
  } catch (error) {
    console.error("Error fetching available states:", error);
    return [];
  }
}; 