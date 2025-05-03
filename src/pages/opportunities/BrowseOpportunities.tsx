
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOpportunityBrowse } from "@/hooks/useOpportunityBrowse";
import { supabase } from "@/integrations/supabase/client";
import BrowseOpportunityList from "@/components/opportunities/BrowseOpportunityList";

const BrowseOpportunities = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    opportunities, 
    isLoading, 
    userApplications, 
    setUserApplications,
    setOpportunities 
  } = useOpportunityBrowse();

  const handleApply = async (opportunityId: string) => {
    if (!user?.id) return;
    
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
        isLoading={isLoading}
        onApply={handleApply}
      />
    </div>
  );
};

export default BrowseOpportunities;
