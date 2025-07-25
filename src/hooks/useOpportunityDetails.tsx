import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Opportunity, Application, RunClubProfile } from "@/types";
import { fetchRunClubProfile } from "@/utils/profileUtils";
import { trackOpportunityView } from "@/services/opportunityService";

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
      // First fetch the opportunity
      const { data: opportunityData, error: opportunityError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', opportunityId)
        .single();
      
      if (opportunityError) throw opportunityError;
      
      // Then fetch the brand information separately
      const { data: brandData, error: brandError } = await supabase
        .from('brand_profiles')
        .select('company_name, logo_url')
        .eq('id', opportunityData.brand_id)
        .maybeSingle();
      
      // Combine the data
      const completeOpportunity: Opportunity = {
        ...opportunityData,
        brand: brandError ? null : { 
          company_name: brandData?.company_name || "Unknown Brand",
          logo_url: brandData?.logo_url
        }
      };
      
      setOpportunity(completeOpportunity);
      
      // Track view for run clubs viewing opportunities (not their own brand's opportunities)
      if (userType === 'run_club' && user.id !== opportunityData.brand_id) {
        try {
          await trackOpportunityView(opportunityId, user.id);
        } catch (error) {
          console.error("Error tracking opportunity view:", error);
          // Don't fail the whole operation if view tracking fails
        }
      }
      
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

  const handleApply = async (pitch: string) => {
    if (!user || !opportunity) {
      toast({
        title: "Error",
        description: "Unable to submit application. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Check if user has already applied
      const { data: existingApp } = await supabase
        .from('applications')
        .select('id')
        .eq('opportunity_id', opportunity.id)
        .eq('run_club_id', user.id)
        .single();

      if (existingApp) {
        toast({
          title: "Already Applied",
          description: "You have already applied to this opportunity.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: opportunity.id,
          run_club_id: user.id,
          status: 'pending',
          pitch: pitch
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
        created_at: new Date().toISOString(),
        pitch: pitch
      });
      
      return true;
    } catch (error: any) {
      console.error("Error applying to opportunity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
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
