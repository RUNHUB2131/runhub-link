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

interface EditMemberCountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<RunClubProfile>;
  onSave: (data: Partial<RunClubProfile>) => Promise<void>;
}

export function EditMemberCountDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditMemberCountDialogProps) {
  const [memberCount, setMemberCount] = useState(profile.member_count || 0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMemberCount(profile.member_count || 0);
    }
  }, [open, profile.member_count]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave({ member_count: memberCount });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving member count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Member Count</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="member_count">Number of Members</Label>
            <Input
              id="member_count"
              type="number"
              value={memberCount}
              onChange={(e) => setMemberCount(parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
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