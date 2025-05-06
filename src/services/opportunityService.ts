
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity } from "@/types";

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
        applications_count: count || 0,
        requirements: opp.requirements || null, // Ensure requirements is included even if null
      } as Opportunity;
    })
  );
  
  return opportunitiesWithCounts;
};

// Improved function to fetch opportunity with brand information
export const fetchOpportunityWithBrand = async (opportunityId: string) => {
  try {
    console.log("Fetching opportunity with ID:", opportunityId);
    
    // Use a JOIN query to get both opportunity and brand data in one request
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        brand:brand_profiles (
          company_name, 
          logo_url
        )
      `)
      .eq('id', opportunityId)
      .single();
    
    if (error) {
      console.error("Error fetching opportunity with brand:", error);
      throw error;
    }
    
    if (!data) {
      console.error("No opportunity found with ID:", opportunityId);
      return null;
    }
    
    // Ensure proper structure and handle missing brand data
    const completeOpportunity: Opportunity = {
      ...data,
      requirements: data.requirements || null, // Ensure requirements exists
      brand: data.brand ? {
        company_name: data.brand.company_name || "Unknown Brand",
        logo_url: data.brand.logo_url
      } : {
        company_name: "Unknown Brand",
        logo_url: undefined
      }
    };
    
    console.log("Fetched complete opportunity with brand:", completeOpportunity);
    return completeOpportunity;
  } catch (error) {
    console.error("Error in fetchOpportunityWithBrand:", error);
    return null;
  }
};

// Improved function to fetch opportunities for browsing (with brand information)
export const fetchBrowseOpportunities = async () => {
  try {
    console.log("Fetching browse opportunities with brands");
    
    // Use a JOIN query to get both opportunity and brand data in one request
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        brand:brand_profiles (
          company_name,
          logo_url
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching opportunities with brands:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No opportunities found");
      return [];
    }
    
    // Transform the data to match the expected Opportunity type
    const opportunitiesWithBrands: Opportunity[] = data.map(opp => {
      return {
        ...opp,
        requirements: opp.requirements || null, // Ensure requirements exists
        brand: opp.brand ? {
          company_name: opp.brand.company_name || "Unknown Brand",
          logo_url: opp.brand.logo_url
        } : {
          company_name: "Unknown Brand",
          logo_url: undefined
        }
      };
    });
    
    console.log("Processed opportunities with brands:", opportunitiesWithBrands.length);
    // Debug log the first item to verify structure
    if (opportunitiesWithBrands.length > 0) {
      console.log("Sample opportunity with brand:", opportunitiesWithBrands[0]);
    }
    
    return opportunitiesWithBrands;
  } catch (error) {
    console.error("Error in fetchBrowseOpportunities:", error);
    return [];
  }
};
