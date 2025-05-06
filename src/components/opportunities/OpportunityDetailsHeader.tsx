
import { Opportunity, Application, RunClubProfile } from "@/types";
import OpportunityBrandInfo from "@/components/opportunities/OpportunityBrandInfo";
import OpportunityActionButton from "@/components/opportunities/OpportunityActionButton";

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
  // Log the opportunity to debug
  console.log("Opportunity in header:", opportunity);
  console.log("Brand information:", opportunity.brand);
  
  return (
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
        application={application}
        isApplying={isApplying}
        handleApply={handleApply}
        showApplications={showApplications}
        setShowApplications={setShowApplications}
        runClubProfile={runClubProfile}
      />
    </div>
  );
};

export default OpportunityDetailsHeader;
