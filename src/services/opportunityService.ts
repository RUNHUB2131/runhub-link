
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
    
    // Fetch the opportunity first
    const { data: opportunityData, error: opportunityError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();
    
    if (opportunityError) {
      console.error("Error fetching opportunity:", opportunityError);
      throw opportunityError;
    }
    
    if (!opportunityData) {
      console.error("No opportunity found with ID:", opportunityId);
      return null;
    }
    
    // Then fetch the brand data separately
    const { data: brandData, error: brandError } = await supabase
      .from('brand_profiles')
      .select('company_name, logo_url')
      .eq('id', opportunityData.brand_id)
      .maybeSingle();
    
    // Combine the data
    const completeOpportunity: Opportunity = {
      ...opportunityData,
      brand: brandData ? {
        company_name: brandData.company_name || "Unknown Brand",
        logo_url: brandData.logo_url
      } : {
        company_name: "Unknown Brand",
        logo_url: undefined
      }
    };
    
    console.log("Fetched complete opportunity:", completeOpportunity);
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
    
    // First fetch all opportunities
    const { data: opportunitiesData, error: opportunitiesError } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (opportunitiesError) {
      console.error("Error fetching opportunities:", opportunitiesError);
      throw opportunitiesError;
    }
    
    if (!opportunitiesData || opportunitiesData.length === 0) {
      return [];
    }
    
    // Then fetch all brand profiles needed
    const brandIds = [...new Set(opportunitiesData.map(opp => opp.brand_id))];
    const { data: brandsData, error: brandsError } = await supabase
      .from('brand_profiles')
      .select('id, company_name, logo_url')
      .in('id', brandIds);
    
    if (brandsError) {
      console.error("Error fetching brands:", brandsError);
    }
    
    // Create a map for quick brand lookups
    const brandsMap = new Map();
    if (brandsData) {
      brandsData.forEach(brand => {
        brandsMap.set(brand.id, {
          company_name: brand.company_name || "Unknown Brand",
          logo_url: brand.logo_url
        });
      });
    }
    
    // Combine opportunity data with brand data
    const opportunitiesWithBrands: Opportunity[] = opportunitiesData.map(opp => {
      const brandInfo = brandsMap.get(opp.brand_id) || {
        company_name: "Unknown Brand",
        logo_url: undefined
      };
      
      return {
        ...opp,
        brand: brandInfo
      };
    });
    
    console.log("Processed opportunities with brands:", opportunitiesWithBrands);
    return opportunitiesWithBrands;
  } catch (error) {
    console.error("Error in fetchBrowseOpportunities:", error);
    return [];
  }
};
