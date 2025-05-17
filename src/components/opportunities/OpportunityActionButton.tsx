import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { isProfileComplete } from "@/utils/profileCompletionUtils";
import { Application, RunClubProfile, Opportunity } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { checkChatExistsForApplication } from "@/services/chat";
import { ApplicationConfirmationDialog } from "./ApplicationConfirmationDialog";

interface OpportunityActionButtonProps {
  userType: 'run_club' | 'brand' | undefined;
  userId: string | undefined;
  brandId: string;
  opportunityId: string;
  opportunity: Opportunity;
  application: Application | null;
  isApplying: boolean;
  handleApply: () => Promise<boolean>;
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
    setShowConfirmDialog(true);
  };

  const handleConfirmApply = async () => {
    try {
      const success = await handleApply();
      if (success) {
        setShowConfirmDialog(false);
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
        <Button onClick={() => setShowApplications(!showApplications)}>
          {showApplications ? "Hide Applications" : "View Applications"}
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
    
    // Check if profile is complete before showing apply button
    const isComplete = isProfileComplete(runClubProfile);
    
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={handleApplyClick}
                  disabled={isApplying || !isComplete}
                >
                  {isApplying ? "Applying..." : "Apply Now"}
                </Button>
              </div>
            </TooltipTrigger>
            {!isComplete && (
              <TooltipContent>
                <p>Complete your profile before applying</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <ApplicationConfirmationDialog
          opportunity={opportunity}
          isOpen={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          onConfirm={handleConfirmApply}
          isApplying={isApplying}
        />
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
