
import { Button } from "@/components/ui/button";
import { Application } from "@/types";
import { useNavigate } from "react-router-dom";

interface OpportunityActionButtonProps {
  userType: string | undefined;
  userId: string | undefined;
  brandId: string | undefined;
  opportunityId: string;
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
  opportunityId,
  application,
  isApplying,
  handleApply,
  showApplications,
  setShowApplications
}: OpportunityActionButtonProps) => {
  const navigate = useNavigate();

  const handleViewApplications = () => {
    // Navigate to the dedicated applications page
    navigate(`/opportunities/applications/${opportunityId}`);
  };

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
        onClick={handleViewApplications}
        className="w-full md:w-auto bg-white text-black border border-gray-200 hover:bg-gray-100"
      >
        View Applications
      </Button>
    );
  }
  
  return null;
};

export default OpportunityActionButton;
