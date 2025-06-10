import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RunClubProfile } from "@/types";

interface EditClubNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<RunClubProfile>;
  onSave: (data: Partial<RunClubProfile>) => Promise<void>;
}

export function EditClubNameDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditClubNameDialogProps) {
  const [clubName, setClubName] = useState(profile.club_name || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setClubName(profile.club_name || "");
    }
  }, [open, profile.club_name]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave({ club_name: clubName });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving club name:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Club Name</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="club_name">Club Name</Label>
            <Input
              id="club_name"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Your run club name"
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