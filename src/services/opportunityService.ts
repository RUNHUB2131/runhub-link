
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
  brand_id: string;
  brand?: {
    company_name: string;
    logo_url?: string;
  };
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
      
      return {
        ...opp,
        applications_count: count || 0
      };
    })
  );
  
  return opportunitiesWithCounts;
};

// Add this new function to fetch opportunities with brand information
export const fetchOpportunityWithBrand = async (opportunityId: string) => {
  try {
    // First, fetch the opportunity
    const { data: opportunityData, error: opportunityError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();
    
    if (opportunityError) throw opportunityError;
    
    // Then fetch the brand information
    const { data: brandData, error: brandError } = await supabase
      .from('brand_profiles')
      .select('company_name, logo_url')
      .eq('id', opportunityData.brand_id)
      .single();
    
    if (brandError) {
      console.error("Error fetching brand information:", brandError);
      // Return the opportunity without brand info rather than failing completely
      return opportunityData;
    }
    
    // Combine the data
    return {
      ...opportunityData,
      brand: brandData
    };
  } catch (error) {
    console.error("Error fetching opportunity with brand:", error);
    return null;
  }
};

// Add this function to fetch opportunities for browsing (with brand information)
export const fetchBrowseOpportunities = async () => {
  try {
    // First fetch all opportunities
    const { data: opportunitiesData, error: opportunitiesError } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (opportunitiesError) throw opportunitiesError;
    
    // Then fetch brand information for each opportunity
    const opportunitiesWithBrands = await Promise.all(
      (opportunitiesData || []).map(async (opp) => {
        const { data: brandData, error: brandError } = await supabase
          .from('brand_profiles')
          .select('company_name, logo_url')
          .eq('id', opp.brand_id)
          .single();
        
        return {
          ...opp,
          brand: brandError ? null : brandData
        };
      })
    );
    
    return opportunitiesWithBrands;
  } catch (error) {
    console.error("Error fetching browse opportunities:", error);
    return [];
  }
};
