import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { RunClubProfile } from "@/types";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuth } from "@/contexts/AuthContext";

interface EditBasicInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<RunClubProfile>;
  onSave: (data: Partial<RunClubProfile>) => Promise<void>;
}

export function EditBasicInfoDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditBasicInfoDialogProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    club_name: profile.club_name || "",
    description: profile.description || "",
    location: profile.location || "",
    website: profile.website || "",
    logo_url: profile.logo_url || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      logo_url: url
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Basic Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <ImageUpload 
              userId={user?.id || ''}
              currentImageUrl={formData.logo_url}
              onImageUpload={handleLogoUpload}
              size="lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="club_name">Club Name</Label>
            <Input
              id="club_name"
              name="club_name"
              value={formData.club_name}
              onChange={handleChange}
              placeholder="Your run club name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Tell us about yourself</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your run club"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
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
