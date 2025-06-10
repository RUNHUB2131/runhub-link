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
import { PitchDialog } from "./PitchDialog";
import { Calendar, Gift } from "lucide-react";

interface BrowseOpportunityCardProps {
  opportunity: Opportunity;
  onApply: (opportunityId: string, pitch: string) => void;
  runClubProfile?: Partial<RunClubProfile>;
}

const BrowseOpportunityCard = ({ opportunity, onApply, runClubProfile = {} }: BrowseOpportunityCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userType } = useAuth();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showPitchDialog, setShowPitchDialog] = useState(false);
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
    navigate('/profile/personal-information');
  };

  const handleConfirmApply = async () => {
    setShowApplyDialog(false);
    setShowPitchDialog(true);
  };

  const handlePitchSubmit = async (pitch: string) => {
    setIsApplying(true);
    await onApply(opportunity.id, pitch);
    setIsApplying(false);
    setShowPitchDialog(false);
  };

  // Format the deadline date nicely
  const formatDeadline = (deadline: string) => {
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return deadline;
    }
  };

  console.log("Rendering opportunity in BrowseOpportunityCard:", opportunity);

  return (
    <>
      <Card 
        key={opportunity.id} 
        className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-l-4 border-l-primary"
        onClick={handleViewOpportunity}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Main content */}
            <div className="flex-1 min-w-0">
              <OpportunityBrandInfo opportunity={opportunity} />
              
              <CardTitle className="text-lg font-bold mt-2 mb-3 line-clamp-2 text-gray-900">
                {opportunity.title}
              </CardTitle>
              
              <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Due {formatDeadline(opportunity.submission_deadline)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Gift className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-emerald-700">
                    {opportunity.club_incentives}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <Button 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2"
                onClick={handleApply}
              >
                Apply Now
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewOpportunity();
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
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

      <PitchDialog
        opportunity={opportunity}
        isOpen={showPitchDialog}
        onOpenChange={setShowPitchDialog}
        onSubmit={handlePitchSubmit}
        isSubmitting={isApplying}
      />
    </>
  );
};

export default BrowseOpportunityCard;
