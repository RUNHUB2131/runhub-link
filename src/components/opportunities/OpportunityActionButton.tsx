
import { Button } from "@/components/ui/button";
import { Application, RunClubProfile } from "@/types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isProfileComplete, getMissingProfileFields } from "@/utils/profileCompletionUtils";

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
  runClubProfile?: Partial<RunClubProfile>;
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
  setShowApplications,
  runClubProfile = {}
}: OpportunityActionButtonProps) => {
  const navigate = useNavigate();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  const profileComplete = isProfileComplete(runClubProfile);
  const missingFields = getMissingProfileFields(runClubProfile);

  const handleViewApplications = () => {
    // Navigate to the dedicated applications page
    navigate(`/opportunities/applications/${opportunityId}`);
  };
  
  const handleApplyClick = () => {
    if (profileComplete) {
      handleApply();
    } else {
      setShowProfileDialog(true);
    }
  };
  
  const handleCompleteProfile = () => {
    setShowProfileDialog(false);
    navigate('/profile');
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
        <>
          <Button 
            onClick={handleApplyClick} 
            disabled={isApplying} 
            className="w-full md:w-auto"
          >
            {isApplying ? "Applying..." : "Apply Now"}
          </Button>
          
          <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Complete Your Profile</DialogTitle>
                <DialogDescription>
                  You need to complete your run club profile before applying to opportunities.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <h4 className="font-medium mb-2">Missing information:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {missingFields.map((field, index) => (
                    <li key={index} className="text-sm">{field}</li>
                  ))}
                </ul>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                  Later
                </Button>
                <Button onClick={handleCompleteProfile}>
                  Complete Profile
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
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
