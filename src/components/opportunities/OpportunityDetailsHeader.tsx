import { Opportunity, Application, RunClubProfile } from "@/types";
import OpportunityBrandInfo from "@/components/opportunities/OpportunityBrandInfo";
import OpportunityActionButton from "@/components/opportunities/OpportunityActionButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-3 p-0 hover:bg-transparent text-gray-600 hover:text-gray-900" 
          onClick={() => navigate('/opportunities')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Back to opportunities</span>
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
