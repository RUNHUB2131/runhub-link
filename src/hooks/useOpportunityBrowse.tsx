
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity } from "@/types";

export const useOpportunityBrowse = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userApplications, setUserApplications] = useState<string[]>([]);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const fetchUserApplications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log("Fetching user applications for user ID:", user.id);
      // Fetch all opportunities this run club has already applied for
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('opportunity_id')
        .eq('run_club_id', user.id);
      
      if (applicationsError) {
        console.error("Error fetching user applications:", applicationsError);
        throw applicationsError;
      }
      
      // Extract just the opportunity IDs into an array
      const appliedOpportunityIds = (applicationsData || []).map(app => app.opportunity_id);
      console.log("User has applied to these opportunities:", appliedOpportunityIds);
      setUserApplications(appliedOpportunityIds);
    } catch (error: any) {
      console.error("Error fetching user applications:", error);
    }
  }, [user?.id]);

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching opportunities, applied opportunities:", userApplications);
      // First, fetch all opportunities
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (opportunitiesError) {
        console.error("Error fetching opportunities:", opportunitiesError);
        throw opportunitiesError;
      }
      
      if (!opportunitiesData) {
        setOpportunities([]);
        setIsLoading(false);
        return;
      }
      
      // Then, for each opportunity, fetch the brand information separately
      const enhancedOpportunities = await Promise.all(
        opportunitiesData.map(async (opp) => {
          // Get brand profile for each opportunity
          const { data: brandData, error: brandError } = await supabase
            .from('brand_profiles')
            .select('company_name, logo_url')
            .eq('id', opp.brand_id)
            .single();
          
          if (brandError) {
            console.error(`Error fetching brand info for opportunity ${opp.id}:`, brandError);
            return {
              ...opp,
              brand: {
                company_name: "Unknown Brand",
                logo_url: undefined
              }
            } as Opportunity;
          }
          
          return {
            ...opp,
            brand: {
              company_name: brandData?.company_name || "Unknown Brand",
              logo_url: brandData?.logo_url
            }
          } as Opportunity;
        })
      );
      
      // Filter out opportunities the user has already applied for
      const filteredOpportunities = enhancedOpportunities.filter(
        opp => !userApplications.includes(opp.id)
      );
      
      console.log("Filtered opportunities:", filteredOpportunities.length);
      console.log("Sample opportunity with brand:", filteredOpportunities[0]);
      setOpportunities(filteredOpportunities);
    } catch (error: any) {
      console.error("Error fetching opportunities:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userApplications, toast]);

  useEffect(() => {
    if (user?.id) {
      fetchUserApplications();
    }
  }, [user?.id, lastRefresh, fetchUserApplications]);

  // Update to fetch opportunities AFTER we have user applications
  useEffect(() => {
    if (user?.id) {
      fetchOpportunities();
    }
  }, [userApplications, lastRefresh, fetchOpportunities, user?.id]); 

  // Add a method to refresh the data when an application is withdrawn
  const refreshAfterWithdrawal = useCallback(() => {
    console.log("Refreshing after withdrawal");
    setLastRefresh(Date.now()); // This will trigger both useEffects
  }, []);

  // Add a simple method to force a refresh
  const refresh = useCallback(() => {
    console.log("Manual refresh triggered");
    setLastRefresh(Date.now());
  }, []);

  return {
    opportunities,
    isLoading,
    userApplications,
    setUserApplications,
    setOpportunities,
    refreshAfterWithdrawal,
    refresh
  };
};
