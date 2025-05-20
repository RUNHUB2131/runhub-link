import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Opportunity, RunClubProfile } from "@/types";
import { isProfileComplete, getMissingProfileFields } from "@/utils/profileCompletionUtils";
import OpportunityBrandInfo from "./OpportunityBrandInfo";
import { ApplicationConfirmationDialog } from "./ApplicationConfirmationDialog";

interface BrowseOpportunityCardProps {
  opportunity: Opportunity;
  onApply: (opportunityId: string) => void;
  runClubProfile?: Partial<RunClubProfile>;
}

const BrowseOpportunityCard = ({ opportunity, onApply, runClubProfile = {} }: BrowseOpportunityCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userType } = useAuth();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  const profileComplete = isProfileComplete(runClubProfile);
  const missingFields = getMissingProfileFields(runClubProfile);

  useEffect(() => {
    console.log("\n=== BrowseOpportunityCard Component ===");
    console.log("Opportunity data:", opportunity);
    console.log("Brand ID:", opportunity.brand_id);
    console.log("Brand data:", opportunity.brand);
    console.log("User type:", userType);
  }, [opportunity, userType]);

  const handleViewOpportunity = () => {
    console.log("Navigating to opportunity:", opportunity.id);
    navigate(`/opportunities/${opportunity.id}`);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userType) {
      setShowProfileDialog(true);
      return;
    }
    if (userType === 'run_club') {
      if (!isProfileComplete(runClubProfile)) {
        setShowProfileDialog(true);
        return;
      }
      setShowApplyDialog(true);
    }
  };

  const handleCompleteProfile = () => {
    setShowProfileDialog(false);
    navigate('/profile');
  };

  const handleConfirmApply = async () => {
    setIsApplying(true);
    await onApply(opportunity.id);
    setIsApplying(false);
    setShowApplyDialog(false);
  };

  console.log("Rendering opportunity in BrowseOpportunityCard:", opportunity);

  return (
    <>
      <Card 
        key={opportunity.id} 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleViewOpportunity}
      >
        <CardHeader className="pb-2">
          <OpportunityBrandInfo opportunity={opportunity} />
          <CardTitle className="line-clamp-2 mt-2">{opportunity.title}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-gray-500 mb-2">
            Application Due: {opportunity.submission_deadline}
          </p>
          <div className="mt-3 py-2 px-3 bg-primary-50 rounded-md">
            <p className="font-medium">Incentive: {opportunity.club_incentives}</p>
          </div>
        </CardContent>
        
        <CardFooter>
          <div className="w-full flex gap-2">
            <Button 
              variant="outline"
              className="w-1/2"
              onClick={(e) => {
                e.stopPropagation();
                handleViewOpportunity();
              }}
            >
              View Details
            </Button>
            <Button 
              className="w-1/2"
              onClick={handleApply}
            >
              Apply Now
            </Button>
          </div>
        </CardFooter>
      </Card>

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

      <ApplicationConfirmationDialog
        opportunity={opportunity}
        isOpen={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        onConfirm={handleConfirmApply}
        isApplying={isApplying}
      />
    </>
  );
};

export default BrowseOpportunityCard;
