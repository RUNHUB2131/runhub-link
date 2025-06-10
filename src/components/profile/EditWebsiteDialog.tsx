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

interface EditWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<RunClubProfile>;
  onSave: (data: Partial<RunClubProfile>) => Promise<void>;
}

export function EditWebsiteDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditWebsiteDialogProps) {
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
      // Ensure website starts with https://
      let cleanedWebsite = website.trim();
      if (cleanedWebsite && !/^https?:\/\//i.test(cleanedWebsite)) {
        cleanedWebsite = 'https://' + cleanedWebsite;
      }
      
      await onSave({ website: cleanedWebsite });
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
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
            />
            <p className="text-xs text-muted-foreground">
              You can enter just the domain (e.g., yoursite.com)
            </p>
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