
import { Application } from "@/types";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OpportunityBrandInfo from "@/components/opportunities/OpportunityBrandInfo";
import { useState } from "react";
import { X } from "lucide-react";
import { withdrawApplication } from "@/services/applicationService";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface ApplicationWithOpportunity extends Application {
  opportunities?: {
    id: string;
    title: string;
    description: string;
    brand_id: string;
    reward: string;
    deadline: string | null;
    created_at: string;
    brand?: {
      company_name: string;
      logo_url?: string;
    } | null;
  };
}

interface ApplicationCardProps {
  application: ApplicationWithOpportunity;
  onWithdraw?: (applicationId: string) => void;
}

const ApplicationCard = ({ application, onWithdraw }: ApplicationCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  if (!application.opportunities) {
    return null;
  }

  const opportunity = application.opportunities;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#FEC6A1] text-[#7d4829] hover:bg-[#FEC6A1]';
      case 'accepted':
        return 'bg-[#F2FCE2] text-[#4c7520] hover:bg-[#F2FCE2]';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };

  const viewOpportunity = (opportunityId: string) => {
    navigate(`/opportunities/${opportunityId}`);
  };

  const handleWithdrawClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAlertOpen(true);
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const result = await withdrawApplication(application.id);
      
      toast({
        title: "Application withdrawn",
        description: "You can now apply to this opportunity again",
      });
      
      // Verify the withdrawal went through before calling onWithdraw
      if (result && result.success) {
        console.log("Withdrawal successful, updating UI", result);
        if (onWithdraw) {
          onWithdraw(application.id);
        }
      } else {
        throw new Error("Withdrawal did not return a success status");
      }
    } catch (error) {
      console.error("Failed to withdraw application:", error);
      toast({
        title: "Error",
        description: "Failed to withdraw application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div>
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <OpportunityBrandInfo opportunity={{
                    brand_id: opportunity.brand_id,
                    brand: opportunity.brand || null
                  } as any} />
                </div>
              </div>
            </div>
            <Badge 
              variant="outline"
              className={getStatusBadgeClass(application.status)}
            >
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm line-clamp-2">{opportunity.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div>
                <strong>Reward:</strong> {opportunity.reward}
              </div>
              {opportunity.deadline && (
                <div>
                  <strong>Deadline:</strong> {new Date(opportunity.deadline).toLocaleDateString()}
                </div>
              )}
              <div>
                <strong>Applied on:</strong> {new Date(application.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => viewOpportunity(opportunity.id)}
          >
            View Opportunity
          </Button>
          
          {application.status === "pending" && (
            <Button 
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
              onClick={handleWithdrawClick}
              disabled={isWithdrawing}
            >
              <X className="h-4 w-4 mr-1" />
              {isWithdrawing ? "Withdrawing..." : "Withdraw Application"}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw your application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              className="bg-red-500 hover:bg-red-600"
            >
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApplicationCard;
