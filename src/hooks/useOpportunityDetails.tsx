
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Opportunity, Application, RunClubProfile } from "@/types";
import { fetchRunClubProfile } from "@/utils/profileUtils";
import { fetchOpportunityWithBrand } from "@/services/opportunityService";

export const useOpportunityDetails = (opportunityId: string) => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});

  useEffect(() => {
    if (opportunityId) {
      fetchOpportunityDetails();
    }
  }, [opportunityId]);
  
  // Fetch the run club profile if the user is a run club
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || userType !== 'run_club') return;
      
      try {
        const profileData = await fetchRunClubProfile(user.id);
        if (profileData) {
          setRunClubProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching run club profile:", error);
      }
    };
    
    loadProfile();
  }, [user?.id, userType]);

  const fetchOpportunityDetails = async () => {
    if (!opportunityId || !user) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching opportunity details for ID:", opportunityId);
      
      // Use the improved function to fetch opportunity with brand info
      const completeOpportunity = await fetchOpportunityWithBrand(opportunityId);
      
      if (!completeOpportunity) {
        console.error("Failed to fetch opportunity with ID:", opportunityId);
        throw new Error("Failed to fetch opportunity");
      }
      
      console.log("Fetched complete opportunity:", completeOpportunity);
      setOpportunity(completeOpportunity);
      
      // For run clubs, check if they've already applied
      if (userType === 'run_club') {
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select('id, status, created_at, opportunity_id, run_club_id')
          .eq('opportunity_id', opportunityId)
          .eq('run_club_id', user.id)
          .maybeSingle();
        
        if (appError) console.error("Error checking application:", appError);
        
        if (appData) {
          // Ensure status is of the correct type
          if (appData.status === 'pending' || appData.status === 'accepted' || appData.status === 'rejected') {
            setApplication(appData as Application);
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching opportunity details:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunity details",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user || !opportunity) return false;
    
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: opportunity.id,
          run_club_id: user.id,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted",
      });
      
      setApplication({
        id: 'new', // Placeholder ID until we refresh
        opportunity_id: opportunity.id,
        run_club_id: user.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      return true;
    } catch (error: any) {
      console.error("Error applying to opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    opportunity,
    application,
    isLoading,
    runClubProfile,
    handleApply,
  };
};
