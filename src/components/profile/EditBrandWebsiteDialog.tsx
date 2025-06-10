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
import { BrandProfile } from "@/types";

interface EditBrandWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<BrandProfile>;
  onSave: (data: Partial<BrandProfile>) => Promise<void>;
}

export function EditBrandWebsiteDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditBrandWebsiteDialogProps) {
  const [website, setWebsite] = useState(profile.website || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setWebsite(profile.website || "");
    }
  }, [open, profile.website]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave({ website });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving website:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Website</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.com"
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