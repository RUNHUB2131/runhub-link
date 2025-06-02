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

  // Create a unique key for localStorage based on user ID and dialog type
  const storageKey = `editBasicInfo_${user?.id}_draft`;

  // Load draft data from localStorage when dialog opens
  useEffect(() => {
    if (open) {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          setFormData(draftData);
        } catch (error) {
          console.error("Error parsing saved draft:", error);
          // Fallback to profile data if draft is corrupted
          setFormData({
            club_name: profile.club_name || "",
            description: profile.description || "",
            location: profile.location || "",
            website: profile.website || "",
            logo_url: profile.logo_url || "",
          });
        }
      } else {
        // No draft exists, use current profile data
        setFormData({
          club_name: profile.club_name || "",
          description: profile.description || "",
          location: profile.location || "",
          website: profile.website || "",
          logo_url: profile.logo_url || "",
        });
      }
    }
  }, [open, profile, storageKey]);

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    if (open) {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    }
  }, [formData, open, storageKey]);

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
      // Clear the draft after successful save
      localStorage.removeItem(storageKey);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Clear the draft when user explicitly cancels
    localStorage.removeItem(storageKey);
    onOpenChange(false);
  };

  const handleClickOutside = () => {
    // Clear the draft when user clicks outside (implicit cancel)
    localStorage.removeItem(storageKey);
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Dialog is being closed - clear the draft (same as cancel)
      localStorage.removeItem(storageKey);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[525px]"
        onInteractOutside={(e) => {
          // Allow pointer events (clicks) to close dialog and discard changes
          // but prevent focus events (tab switching) from closing
          if (e.type === 'focusout') {
            e.preventDefault();
          } else {
            // This is a pointer event (click outside) - close and discard
            handleClickOutside();
          }
        }}
      >
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
          <Button onClick={handleCancel} variant="outline">
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
