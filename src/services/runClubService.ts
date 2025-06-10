import { supabase } from "@/integrations/supabase/client";
import { RunClubProfile } from "@/types";

export interface RunClubOption {
  id: string;
  club_name: string;
  city?: string;
  state?: string;
  member_count?: number;
}

export const searchRunClubs = async (searchTerm: string = "", limit: number = 20): Promise<RunClubOption[]> => {
  try {
    let query = supabase
      .from('run_club_profiles')
      .select('id, club_name, city, state, member_count')
      .not('club_name', 'is', null)
      .order('club_name', { ascending: true })
      .limit(limit);

    // Apply search filter if provided - search only by club name
    if (searchTerm.trim()) {
      query = query.ilike('club_name', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error searching run clubs:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in searchRunClubs:", error);
    throw error;
  }
};

export const getRunClubById = async (clubId: string): Promise<RunClubOption | null> => {
  try {
    const { data, error } = await supabase
      .from('run_club_profiles')
      .select('id, club_name, city, state, member_count')
      .eq('id', clubId)
      .single();

    if (error) {
      console.error("Error fetching run club:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getRunClubById:", error);
    return null;
  }
}; 