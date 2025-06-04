import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Opportunity } from "@/types";

interface PitchDialogProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (pitch: string) => Promise<void>;
  isSubmitting: boolean;
}

export function PitchDialog({
  opportunity,
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting
}: PitchDialogProps) {
  const [pitch, setPitch] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = async () => {
    if (pitch.trim()) {
      await onSubmit(pitch.trim());
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      onOpenChange(open);
      if (!open) {
        setPitch(""); // Reset pitch when dialog closes
        setShowDetails(false); // Reset collapsible state
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write Your Pitch</DialogTitle>
          <DialogDescription>
            Tell {opportunity.brand?.company_name || "the brand"} why your run club is perfect for this opportunity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pitch">Your Pitch</Label>
            <Textarea
              id="pitch"
              placeholder="Explain why your run club is the perfect fit for this opportunity..."
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              rows={6}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500">
              {pitch.length}/500 characters
            </p>
          </div>

          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <span className="text-sm font-medium">View Opportunity Details</span>
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-2 p-4 bg-gray-50 rounded-lg border">
              <div>
                <h4 className="font-semibold text-sm mb-2">{opportunity.title}</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span className="font-medium">Activation Overview:</span>
                  <p className="text-gray-700 mt-1">{opportunity.activation_overview}</p>
                </div>
                
                <div>
                  <span className="font-medium">Primary Objective:</span>
                  <p className="text-gray-700 mt-1">
                    {opportunity.primary_objective === 'other' 
                      ? opportunity.primary_objective_other 
                      : opportunity.primary_objective}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium">Club Incentives:</span>
                  <p className="text-gray-700 mt-1">{opportunity.club_incentives}</p>
                </div>
                
                <div>
                  <span className="font-medium">Club Responsibilities:</span>
                  <p className="text-gray-700 mt-1">{opportunity.club_responsibilities}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Launch Date:</span>
                    <p className="text-gray-700 mt-1">{new Date(opportunity.target_launch_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Application Deadline:</span>
                    <p className="text-gray-700 mt-1">{new Date(opportunity.submission_deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Geographic Locations:</span>
                  <p className="text-gray-700 mt-1">{opportunity.geographic_locations?.join(", ")}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Club Size Preference:</span>
                    <p className="text-gray-700 mt-1">{opportunity.club_size_preference}</p>
                  </div>
                  <div>
                    <span className="font-medium">Online Reach Preference:</span>
                    <p className="text-gray-700 mt-1">{opportunity.online_reach_preference}</p>
                  </div>
                </div>
                
                {opportunity.additional_notes && (
                  <div>
                    <span className="font-medium">Additional Notes:</span>
                    <p className="text-gray-700 mt-1">{opportunity.additional_notes}</p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !pitch.trim()}
            className="w-full"
          >
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 