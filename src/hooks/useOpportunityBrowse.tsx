
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (user?.id) {
      fetchUserApplications();
    }
  }, [user?.id]);

  // Update to fetch opportunities AFTER we have user applications
  useEffect(() => {
    if (user?.id) {
      fetchOpportunities();
    }
  }, [userApplications]); // Depend on userApplications instead of user.id

  const fetchUserApplications = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch all opportunities this run club has already applied for
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('opportunity_id')
        .eq('run_club_id', user.id);
      
      if (applicationsError) throw applicationsError;
      
      // Extract just the opportunity IDs into an array
      const appliedOpportunityIds = (applicationsData || []).map(app => app.opportunity_id);
      setUserApplications(appliedOpportunityIds);
    } catch (error: any) {
      console.error("Error fetching user applications:", error);
    }
  };

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      // First, fetch all opportunities
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (opportunitiesError) throw opportunitiesError;
      
      if (!opportunitiesData) {
        setOpportunities([]);
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
          
          return {
            ...opp,
            brand: brandError ? {
              company_name: "Unknown Brand",
              logo_url: undefined
            } : brandData
          } as Opportunity;
        })
      );
      
      // Filter out opportunities the user has already applied for
      const filteredOpportunities = enhancedOpportunities.filter(
        opp => !userApplications.includes(opp.id)
      );
      
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
  };

  // Add a method to refresh the data when an application is withdrawn
  const refreshAfterWithdrawal = () => {
    fetchUserApplications();
  };

  return {
    opportunities,
    isLoading,
    userApplications,
    setUserApplications,
    setOpportunities,
    refreshAfterWithdrawal
  };
};
