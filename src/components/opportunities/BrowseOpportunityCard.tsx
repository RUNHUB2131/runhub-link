import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Opportunity, RunClubProfile } from "@/types";
import { isProfileComplete, getMissingProfileFields } from "@/utils/profileCompletionUtils";

interface BrowseOpportunityCardProps {
  opportunity: Opportunity;
  onApply: (opportunityId: string) => void;
  runClubProfile?: Partial<RunClubProfile>;
}

const BrowseOpportunityCard = ({ opportunity, onApply, runClubProfile = {} }: BrowseOpportunityCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  const profileComplete = isProfileComplete(runClubProfile);
  const missingFields = getMissingProfileFields(runClubProfile);

  const handleViewOpportunity = () => {
    navigate(`/opportunities/${opportunity.id}`);
  };

  const handleApply = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to details page
    
    if (profileComplete) {
      onApply(opportunity.id);
    } else {
      setShowProfileDialog(true);
    }
  };

  const handleCompleteProfile = () => {
    setShowProfileDialog(false);
    navigate('/profile');
  };

  return (
    <>
      <Card 
        key={opportunity.id} 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleViewOpportunity}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center mb-2">
            {opportunity.brand?.logo_url ? (
              <div className="w-8 h-8 rounded overflow-hidden mr-2 bg-gray-100 flex-shrink-0">
                <img 
                  src={opportunity.brand.logo_url} 
                  alt={opportunity.brand.company_name || "Brand logo"}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-primary-100 text-primary-800 flex items-center justify-center mr-2 flex-shrink-0">
                {(opportunity.brand?.company_name?.[0] || "B").toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-600">
              {opportunity.brand?.company_name || "Unknown Brand"}
            </span>
          </div>
          <CardTitle className="line-clamp-2">{opportunity.title}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-gray-500 mb-2">
            Posted {new Date(opportunity.created_at).toLocaleDateString()}
          </p>
          <p className="line-clamp-3 text-sm">{opportunity.description}</p>
          <div className="mt-3 py-2 px-3 bg-primary-50 rounded-md">
            <p className="font-medium">Reward: {opportunity.reward}</p>
          </div>
          {opportunity.deadline && (
            <p className="text-sm mt-3">
              <span className="font-medium">Deadline:</span> {new Date(opportunity.deadline).toLocaleDateString()}
            </p>
          )}
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
    </>
  );
};

export default BrowseOpportunityCard;
