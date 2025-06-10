import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RunClubProfile } from "@/types";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuth } from "@/contexts/AuthContext";

interface EditLogoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<RunClubProfile>;
  onSave: (data: Partial<RunClubProfile>) => Promise<void>;
}

export function EditLogoDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditLogoDialogProps) {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState(profile.logo_url || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLogoUrl(profile.logo_url || "");
    }
  }, [open, profile.logo_url]);

  const handleLogoUpload = (url: string) => {
    setLogoUrl(url);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave({ logo_url: logoUrl });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving logo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Logo</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex justify-center">
            <ImageUpload 
              userId={user?.id || ''}
              currentImageUrl={logoUrl}
              onImageUpload={handleLogoUpload}
              size="lg"
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