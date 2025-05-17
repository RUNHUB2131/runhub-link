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
  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return `Complete by ${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
  };

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
              <p><span className="font-medium">Reward:</span> {opportunity.reward}</p>
              {opportunity.duration && (
                <p><span className="font-medium">Duration:</span> {opportunity.duration}</p>
              )}
              {opportunity.deadline && (
                <p><span className="font-medium">Deadline:</span> {formatDeadline(opportunity.deadline)}</p>
              )}
            </div>
          </div>

          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Requirements:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {opportunity.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isApplying}>
            {isApplying ? "Applying..." : "Confirm Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 