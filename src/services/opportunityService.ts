
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

// Improved function to fetch opportunity with brand information
export const fetchOpportunityWithBrand = async (opportunityId: string) => {
  try {
    console.log("Fetching opportunity with ID:", opportunityId);
    
    // Use a join to fetch the opportunity and brand data in a single query
    const { data: opportunityData, error: opportunityError } = await supabase
      .from('opportunities')
      .select(`
        *,
        brand:brand_id (
          company_name,
          logo_url
        )
      `)
      .eq('id', opportunityId)
      .single();
    
    if (opportunityError) {
      console.error("Error fetching opportunity with brand:", opportunityError);
      throw opportunityError;
    }
    
    console.log("Fetched opportunity with brand:", opportunityData);
    
    // Ensure we have a valid brand object even if some data is missing
    if (!opportunityData.brand) {
      opportunityData.brand = {
        company_name: "Unknown Brand",
        logo_url: undefined
      };
    }
    
    return opportunityData;
  } catch (error) {
    console.error("Error in fetchOpportunityWithBrand:", error);
    return null;
  }
};

// Improved function to fetch opportunities for browsing (with brand information)
export const fetchBrowseOpportunities = async () => {
  try {
    console.log("Fetching browse opportunities with brands");
    
    // Use a join to fetch all opportunities with their brand information in a single query
    const { data: opportunitiesData, error: opportunitiesError } = await supabase
      .from('opportunities')
      .select(`
        *,
        brand:brand_id (
          company_name,
          logo_url
        )
      `)
      .order('created_at', { ascending: false });
    
    if (opportunitiesError) {
      console.error("Error fetching browse opportunities:", opportunitiesError);
      throw opportunitiesError;
    }
    
    console.log("Fetched opportunities with brands:", opportunitiesData);
    
    // Ensure each opportunity has a valid brand object even if data is missing
    const opportunitiesWithBrands = opportunitiesData.map(opp => ({
      ...opp,
      brand: opp.brand || {
        company_name: "Unknown Brand",
        logo_url: undefined
      }
    }));
    
    return opportunitiesWithBrands;
  } catch (error) {
    console.error("Error in fetchBrowseOpportunities:", error);
    return [];
  }
};
