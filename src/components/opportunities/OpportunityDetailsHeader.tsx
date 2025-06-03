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
  handleApply: () => Promise<boolean>;
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
          className="mr-2 p-0 hover:bg-transparent" 
          onClick={() => navigate('/opportunities')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-xl font-medium">Back to opportunities</span>
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
