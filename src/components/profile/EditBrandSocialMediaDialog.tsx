import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandProfile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Instagram, Facebook, Linkedin } from "lucide-react";

interface EditBrandSocialMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<BrandProfile>;
  onSave: (data: Partial<BrandProfile>) => Promise<void>;
}

export const EditBrandSocialMediaDialog = ({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditBrandSocialMediaDialogProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    social_media: {
      instagram: profile.social_media?.instagram || "",
      facebook: profile.social_media?.facebook || "",
      tiktok: profile.social_media?.tiktok || "",
      linkedin: profile.social_media?.linkedin || "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  // Create a unique key for localStorage based on user ID and dialog type
  const storageKey = `editBrandSocialMedia_${user?.id}_draft`;

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
            social_media: {
              instagram: profile.social_media?.instagram || "",
              facebook: profile.social_media?.facebook || "",
              tiktok: profile.social_media?.tiktok || "",
              linkedin: profile.social_media?.linkedin || "",
            },
          });
        }
      } else {
        // No draft exists, use current profile data
        setFormData({
          social_media: {
            instagram: profile.social_media?.instagram || "",
            facebook: profile.social_media?.facebook || "",
            tiktok: profile.social_media?.tiktok || "",
            linkedin: profile.social_media?.linkedin || "",
          },
        });
      }
    }
  }, [open, profile.social_media, storageKey]);

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    if (open) {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    }
  }, [formData, open, storageKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
      // Clear the draft after successful save
      localStorage.removeItem(storageKey);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving social media:", error);
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
        className="sm:max-w-md"
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
          <DialogTitle>Edit Social Media</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="instagram">
              <Instagram className="h-4 w-4" /> Instagram
            </Label>
            <div className="flex rounded-md overflow-hidden">
              <span className="bg-muted px-3 flex items-center text-muted-foreground text-sm">
                @
              </span>
              <Input
                id="instagram"
                name="instagram"
                value={formData.social_media.instagram}
                onChange={handleChange}
                placeholder="username"
                className="rounded-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="facebook">
              <Facebook className="h-4 w-4" /> Facebook
            </Label>
            <Input
              id="facebook"
              name="facebook"
              value={formData.social_media.facebook}
              onChange={handleChange}
              placeholder="page name or ID"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="tiktok">
              <span className="font-bold">TT</span> TikTok
            </Label>
            <div className="flex rounded-md overflow-hidden">
              <span className="bg-muted px-3 flex items-center text-muted-foreground text-sm">
                @
              </span>
              <Input
                id="tiktok"
                name="tiktok"
                value={formData.social_media.tiktok}
                onChange={handleChange}
                placeholder="username"
                className="rounded-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="linkedin">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </Label>
            <Input
              id="linkedin"
              name="linkedin"
              value={formData.social_media.linkedin}
              onChange={handleChange}
              placeholder="company name"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
