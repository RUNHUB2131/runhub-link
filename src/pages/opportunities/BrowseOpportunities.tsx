
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOpportunityBrowse } from "@/hooks/useOpportunityBrowse";
import { supabase } from "@/integrations/supabase/client";
import BrowseOpportunityList from "@/components/opportunities/BrowseOpportunityList";
import { RunClubProfile } from "@/types";
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
    
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: opportunityId,
          run_club_id: user.id,
          status: 'pending'
        });
      
      if (error) throw error;
      
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
      console.error("Error applying to opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Opportunities</h1>
        <p className="text-gray-500 mt-2">Find sponsorship opportunities for your run club</p>
      </div>
      
      <BrowseOpportunityList 
        opportunities={opportunities}
        isLoading={isLoading || profileLoading}
        onApply={handleApply}
        runClubProfile={runClubProfile}
      />
    </div>
  );
};

export default BrowseOpportunities;
