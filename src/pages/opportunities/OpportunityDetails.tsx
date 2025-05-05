
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isProfileComplete } from "@/utils/profileCompletionUtils";
import { useToast } from "@/hooks/use-toast";
import { useOpportunityDetails } from "@/hooks/useOpportunityDetails";
import OpportunityDetailsSkeleton from "@/components/opportunities/OpportunityDetailsSkeleton";
import OpportunityNotFound from "@/components/opportunities/OpportunityNotFound";
import OpportunityDetailsContent from "@/components/opportunities/OpportunityDetailsContent";
import OpportunityDetailsHeader from "@/components/opportunities/OpportunityDetailsHeader";

const OpportunityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [showApplications, setShowApplications] = useState(false);

  const {
    opportunity,
    application,
    isLoading,
    runClubProfile,
    handleApply
  } = useOpportunityDetails(id || '');

  const handleApplyClick = async () => {
    // Check if profile is complete before applying
    if (!isProfileComplete(runClubProfile)) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile before applying",
        variant: "destructive",
      });
      return false; // Return false to indicate unsuccessful application
    }
    
    setIsApplying(true);
    const success = await handleApply();
    setIsApplying(false);
    
    if (success) {
      // Redirect to my applications page after successful application
      navigate('/applications');
    }
    
    return success; // Return the success value to match the expected Promise<boolean> return type
  };

  if (isLoading) {
    return <OpportunityDetailsSkeleton />;
  }

  if (!opportunity) {
    return <OpportunityNotFound />;
  }

  return (
    <div className="space-y-6">
      <OpportunityDetailsHeader
        opportunity={opportunity}
        userType={userType}
        userId={user?.id}
        application={application}
        isApplying={isApplying}
        handleApply={handleApplyClick}
        showApplications={showApplications}
        setShowApplications={setShowApplications}
        runClubProfile={runClubProfile}
      />
      
      <OpportunityDetailsContent opportunity={opportunity} />
    </div>
  );
};

export default OpportunityDetails;
