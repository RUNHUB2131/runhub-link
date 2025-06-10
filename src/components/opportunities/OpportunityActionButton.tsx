import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isProfileComplete, getMissingProfileFields } from "@/utils/profileCompletionUtils";
import { Application, RunClubProfile, Opportunity } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { checkChatExistsForApplication } from "@/services/chat";
import { ApplicationConfirmationDialog } from "./ApplicationConfirmationDialog";
import { PitchDialog } from "./PitchDialog";

interface OpportunityActionButtonProps {
  userType: 'run_club' | 'brand' | undefined;
  userId: string | undefined;
  brandId: string;
  opportunityId: string;
  opportunity: Opportunity;
  application: Application | null;
  isApplying: boolean;
  handleApply: (pitch: string) => Promise<boolean>;
  showApplications: boolean;
  setShowApplications: (show: boolean) => void;
  runClubProfile: Partial<RunClubProfile>;
}

const OpportunityActionButton = ({
  userType,
  userId,
  brandId,
  opportunityId,
  opportunity,
  application,
  isApplying,
  handleApply,
  showApplications,
  setShowApplications,
  runClubProfile
}: OpportunityActionButtonProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPitchDialog, setShowPitchDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const handleChatClick = async () => {
    if (!application || application.status !== 'accepted') return;
    
    try {
      const existingChatId = await checkChatExistsForApplication(application.id);
      
      if (existingChatId) {
        navigate(`/chat/${existingChatId}`);
      } else {
        toast({
          title: "Chat Not Found",
          description: "The chat for this application cannot be found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking chat existence:", error);
      toast({
        title: "Error",
        description: "Failed to open chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyClick = () => {
    // Check if profile is complete
    if (!isProfileComplete(runClubProfile)) {
      setShowProfileDialog(true);
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleCompleteProfile = () => {
    setShowProfileDialog(false);
    navigate('/profile/personal-information');
  };

  const handleConfirmApply = async () => {
    setShowConfirmDialog(false);
    setShowPitchDialog(true);
  };

  const handlePitchSubmit = async (pitch: string) => {
    try {
      const success = await handleApply(pitch);
      if (success) {
        setShowPitchDialog(false);
        navigate('/applications');
      }
    } catch (error) {
      console.error("Error applying to opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Brand viewing their own opportunity
  if (userType === 'brand' && userId === brandId) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          onClick={() => navigate(`/opportunities/${opportunityId}/applications`)}
        >
          View Applications
        </Button>
      </div>
    );
  }
  
  // Run club viewing an opportunity
  if (userType === 'run_club') {
    // Already applied
    if (application) {
      const buttonProps = {
        disabled: true,
        children: `Application ${application.status}`,
        className: application.status === 'accepted' ? 'bg-green-500 hover:bg-green-600' : 
                 application.status === 'rejected' ? 'bg-red-500 hover:bg-red-600' : undefined
      };
      
      return (
        <div className="flex items-center gap-2">
          <Button {...buttonProps} />
          
          {application.status === 'accepted' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleChatClick}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chat with the brand</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    }
    
    return (
      <>
        <Button
          onClick={handleApplyClick}
          disabled={isApplying}
        >
          {isApplying ? "Applying..." : "Apply Now"}
        </Button>

        <ApplicationConfirmationDialog
          opportunity={opportunity}
          isOpen={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
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
                {getMissingProfileFields(runClubProfile).map((field, index) => (
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
  
  // Not logged in or brand viewing another brand's opportunity
  return (
    <Button 
      variant="outline" 
      onClick={() => navigate('/auth/login')}
    >
      Login to Apply
    </Button>
  );
};

export default OpportunityActionButton;
