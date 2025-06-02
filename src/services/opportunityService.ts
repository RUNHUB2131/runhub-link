import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  reward: string;
  deadline: string | null;
  duration: string | null;
  created_at: string;
  applications_count?: number;
  unseen_applications_count?: number;
  unique_views_count?: number;
}

export const trackOpportunityView = async (opportunityId: string, runClubId: string) => {
  try {
    const { error } = await supabase
      .from('opportunity_views')
      .upsert(
        {
          opportunity_id: opportunityId,
          run_club_id: runClubId
        },
        {
          onConflict: ['opportunity_id', 'run_club_id'],
          ignoreDuplicates: true
        }
      );
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error tracking opportunity view:", error);
    throw error;
  }
};

export const fetchOpportunities = async (userId: string) => {
  // Fetch opportunities created by this brand
  const { data: opportunitiesData, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('brand_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Get application counts and view counts for each opportunity
  const opportunitiesWithCounts = await Promise.all(
    (opportunitiesData || []).map(async (opp) => {
      const { count, error: countError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('opportunity_id', opp.id);
      
      // Add this block to count unseen applications
      const { count: unseenCount, error: unseenError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('opportunity_id', opp.id)
        .eq('seen_by_brand', false);
      
      // Get unique view count
      const { count: viewCount, error: viewError } = await supabase
        .from('opportunity_views')
        .select('*', { count: 'exact', head: true })
        .eq('opportunity_id', opp.id);
      
      if (countError || unseenError || viewError) {
        console.error('Error fetching counts:', { countError, unseenError, viewError });
      }

      return {
        ...opp,
        applications_count: count || 0,
        unseen_applications_count: unseenCount || 0,
        unique_views_count: viewCount || 0
      };
    })
  );
  
  return opportunitiesWithCounts;
};
