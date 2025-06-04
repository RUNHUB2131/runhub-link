import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Opportunity } from "@/types";

interface ApplicationConfirmationDialogProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isApplying: boolean;
}

export function ApplicationConfirmationDialog({
  opportunity,
  isOpen,
  onOpenChange,
  onConfirm,
  isApplying
}: ApplicationConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Application</DialogTitle>
          <DialogDescription>
            Please confirm that your run club can fulfill all the requirements of this opportunity.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-medium mb-2">Opportunity Details:</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Title:</span> {opportunity.title}</p>
              {opportunity.brand && (
                <p><span className="font-medium">Brand:</span> {opportunity.brand.company_name}</p>
              )}
              <p><span className="font-medium">Application Due:</span> {opportunity.submission_deadline}</p>
              <p><span className="font-medium">Incentive:</span> {opportunity.club_incentives}</p>
              <p><span className="font-medium">Activation Launch:</span> {opportunity.target_launch_date}</p>
              <p><span className="font-medium">Activation Overview:</span> {opportunity.activation_overview}</p>
              <p><span className="font-medium">Content Specifications:</span> {opportunity.content_specifications}</p>
              <p><span className="font-medium">Professional Media Requirements:</span> {opportunity.professional_media}</p>
              {opportunity.media_requirements && (
                <p><span className="font-medium">Specific Media Requirements:</span> {opportunity.media_requirements}</p>
              )}
              <p><span className="font-medium">Club Responsibilities:</span> {opportunity.club_responsibilities}</p>
              <p><span className="font-medium">Geographic Locations:</span> {opportunity.geographic_locations?.join(", ")}</p>
              <p><span className="font-medium">Club Size Preference:</span> {opportunity.club_size_preference}</p>
              <p><span className="font-medium">Online Reach Preference:</span> {opportunity.online_reach_preference}</p>
              {opportunity.additional_notes && (
                <p><span className="font-medium">Additional Notes:</span> {opportunity.additional_notes}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onConfirm} disabled={isApplying} className="w-full">
            {isApplying ? "Processing..." : "Next: Write Pitch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 