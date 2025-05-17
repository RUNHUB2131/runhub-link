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
}

export const fetchOpportunities = async (userId: string) => {
  // Fetch opportunities created by this brand
  const { data: opportunitiesData, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('brand_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Get application counts for each opportunity
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
      
      if (countError || unseenError) {
        // Handle error appropriately, perhaps log it or throw a custom error
        console.error('Error fetching application counts:', countError, unseenError);
      }

      return {
        ...opp,
        applications_count: count || 0,
        unseen_applications_count: unseenCount || 0,
      };
    })
  );
  
  return opportunitiesWithCounts;
};
