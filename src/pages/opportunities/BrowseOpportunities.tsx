import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOpportunityBrowse } from "@/hooks/useOpportunityBrowse";
import { supabase } from "@/integrations/supabase/client";
import BrowseOpportunityList from "@/components/opportunities/BrowseOpportunityList";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { RunClubProfile, Opportunity } from "@/types";
import { fetchRunClubProfile } from "@/utils/profileUtils";
import { isProfileComplete } from "@/utils/profileCompletionUtils";

const BrowseOpportunities = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    opportunities, 
    isLoading, 
    userApplications, 
    setUserApplications,
    setOpportunities,
    refreshAfterWithdrawal,
    refresh
  } = useOpportunityBrowse();
  
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});
  const [profileLoading, setProfileLoading] = useState(true);

  // Check if we've been redirected from the applications page with withdrawal info
  useEffect(() => {
    // Get state from location if it exists
    const state = location.state || {};
    const shouldRefresh = state.fromWithdraw;
    const opportunityId = state.opportunityId;
    
    if (shouldRefresh) {
      console.log("Refreshing after withdrawal, opportunity ID:", opportunityId);
      refreshAfterWithdrawal();
      
      // Clean up the state
      navigate(location.pathname, { replace: true, state: {} });
      
      // Show a success message to the user
      toast({
        title: "Application withdrawn",
        description: "The opportunity has been added back to your browse list",
      });
    }
  }, [location.state, navigate, refreshAfterWithdrawal, toast]);

  // Additional refresh when component mounts
  useEffect(() => {
    refresh();
  }, [refresh]);
  
  // Fetch the run club profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        setProfileLoading(true);
        const profileData = await fetchRunClubProfile(user.id);
        if (profileData) {
          setRunClubProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching run club profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    loadProfile();
  }, [user?.id]);

  const handleApply = async (opportunityId: string) => {
    if (!user?.id) return;
    
    // Double-check profile completion before submitting application
    if (!isProfileComplete(runClubProfile)) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile before applying",
        variant: "destructive",
      });
      return;
    }

    // First verify the run club profile exists
    try {
      const { data: profile, error: profileError } = await supabase
        .from('run_club_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Profile verification error:", profileError);
        toast({
          title: "Error",
          description: "Unable to verify your profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Verified run club profile:", profile);
      
      // Now attempt to submit the application
      const { error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: opportunityId,
          run_club_id: user.id,
          status: 'pending'
        });
      
      if (error) {
        console.error("Application submission error:", error);
        throw error;
      }
      
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted",
      });
      
      // Update the userApplications state
      setUserApplications([...userApplications, opportunityId]);
      
      // Remove the opportunity from the list
      setOpportunities(opportunities.filter(opp => opp.id !== opportunityId));
      
      // Redirect to applications page
      navigate('/applications');
      
    } catch (error: any) {
      console.error("Full error details:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Browse Opportunities" 
        description="Find sponsorship opportunities for your run club"
      />
      
      <BrowseOpportunityList 
        opportunities={opportunities as Opportunity[]}
        isLoading={isLoading || profileLoading}
        onApply={handleApply}
        runClubProfile={runClubProfile} 
      />
    </PageContainer>
  );
};

export default BrowseOpportunities;
