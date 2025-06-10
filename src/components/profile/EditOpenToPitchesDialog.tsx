import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BrandProfile } from "@/types";

interface EditOpenToPitchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<BrandProfile>;
  onSave: (data: Partial<BrandProfile>) => Promise<void>;
}

export function EditOpenToPitchesDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditOpenToPitchesDialogProps) {
  const [openToPitches, setOpenToPitches] = useState(profile.open_to_pitches || false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOpenToPitches(profile.open_to_pitches || false);
    }
  }, [open, profile.open_to_pitches]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave({ open_to_pitches: openToPitches });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving open to pitches setting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Pitch Availability</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="open-to-pitches">Open to Pitches</Label>
              <p className="text-sm text-muted-foreground">
                Allow running clubs to reach out with partnership ideas
              </p>
            </div>
            <Switch
              id="open-to-pitches"
              checked={openToPitches}
              onCheckedChange={setOpenToPitches}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 