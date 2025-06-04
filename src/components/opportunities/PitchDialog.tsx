import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
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