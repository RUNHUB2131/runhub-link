
import { Button } from "@/components/ui/button";
import { Application } from "@/types";

interface OpportunityActionButtonProps {
  userType: string | undefined;
  userId: string | undefined;
  brandId: string | undefined;
  application: Application | null;
  isApplying: boolean;
  handleApply: () => void;
  showApplications: boolean;
  setShowApplications: (show: boolean) => void;
}

const OpportunityActionButton = ({
  userType,
  userId,
  brandId,
  application,
  isApplying,
  handleApply,
  showApplications,
  setShowApplications
}: OpportunityActionButtonProps) => {
  if (userType === 'run_club') {
    if (application) {
      return (
        <Button disabled className="w-full md:w-auto">
          Application {application.status}
        </Button>
      );
    } else {
      return (
        <Button 
          onClick={handleApply} 
          disabled={isApplying} 
          className="w-full md:w-auto"
        >
          {isApplying ? "Applying..." : "Apply Now"}
        </Button>
      );
    }
  } else if (userType === 'brand' && brandId === userId) {
    return (
      <Button 
        variant="outline"
        onClick={() => setShowApplications(!showApplications)} 
        className="w-full md:w-auto"
      >
        {showApplications ? "Hide Applications" : "View Applications"}
      </Button>
    );
  }
  
  return null;
};

export default OpportunityActionButton;
