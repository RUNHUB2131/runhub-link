import { Opportunity, Application, RunClubProfile } from "@/types";
import OpportunityBrandInfo from "@/components/opportunities/OpportunityBrandInfo";
import OpportunityActionButton from "@/components/opportunities/OpportunityActionButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface OpportunityDetailsHeaderProps {
  opportunity: Opportunity;
  userType: 'run_club' | 'brand' | undefined;
  userId: string | undefined;
  application: Application | null;
  isApplying: boolean;
  handleApply: (pitch: string) => Promise<boolean>;
  showApplications: boolean;
  setShowApplications: (show: boolean) => void;
  runClubProfile: Partial<RunClubProfile>;
}

const OpportunityDetailsHeader = ({
  opportunity,
  userType,
  userId,
  application,
  isApplying,
  handleApply,
  showApplications,
  setShowApplications,
  runClubProfile
}: OpportunityDetailsHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where the user came from to provide correct back navigation
  const getBackNavigation = () => {
    // Check if the user came from applications page via state
    if (location.state?.from === 'applications') {
      return { path: '/applications', label: 'Back to my applications' };
    }
    
    // Check if there's a referrer in the state
    if (location.state?.from) {
      return { path: location.state.from, label: 'Back' };
    }
    
    // For run clubs who have an application, if they're viewing an opportunity they applied to,
    // it's likely they came from applications
    if (userType === 'run_club' && application) {
      return { path: '/applications', label: 'Back to my applications' };
    }
    
    // Default fallback to opportunities
    return { path: '/opportunities', label: 'Back to opportunities' };
  };

  const backNavigation = getBackNavigation();

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-3 p-0 hover:bg-transparent text-gray-600 hover:text-gray-900" 
          onClick={() => navigate(backNavigation.path)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{backNavigation.label}</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{opportunity?.title}</h1>
          <OpportunityBrandInfo opportunity={opportunity} />
        </div>
        
        <OpportunityActionButton 
          userType={userType}
          userId={userId}
          brandId={opportunity.brand_id}
          opportunityId={opportunity.id}
          opportunity={opportunity}
          application={application}
          isApplying={isApplying}
          handleApply={handleApply}
          showApplications={showApplications}
          setShowApplications={setShowApplications}
          runClubProfile={runClubProfile}
        />
      </div>
    </div>
  );
};

export default OpportunityDetailsHeader;
