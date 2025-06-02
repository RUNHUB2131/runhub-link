import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandProfile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { ImageUpload } from "@/components/ui/image-upload";

interface EditBrandBasicInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<BrandProfile>;
  onSave: (data: Partial<BrandProfile>) => Promise<void>;
}

export const EditBrandBasicInfoDialog = ({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditBrandBasicInfoDialogProps) => {
  const [formData, setFormData] = useState({
    company_name: profile.company_name || "",
    industry: profile.industry || "",
    description: profile.description || "",
    website: profile.website || "",
    logo_url: profile.logo_url || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Create a unique key for localStorage based on user ID and dialog type
  const storageKey = `editBrandBasicInfo_${user?.id}_draft`;

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
            company_name: profile.company_name || "",
            industry: profile.industry || "",
            description: profile.description || "",
            website: profile.website || "",
            logo_url: profile.logo_url || "",
          });
        }
      } else {
        // No draft exists, use current profile data
        setFormData({
          company_name: profile.company_name || "",
          industry: profile.industry || "",
          description: profile.description || "",
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      logo_url: url,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Clean up website input by removing http/https if saving to database
    // The display component will handle proper formatting for links
    try {
      await onSave(formData);
      // Clear the draft after successful save
      localStorage.removeItem(storageKey);
      // Clear sessionStorage immediately to prevent race condition
      sessionStorage.removeItem('dialog_brand-basic-info');
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving brand info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Clear the draft when user explicitly cancels
    localStorage.removeItem(storageKey);
    // Clear sessionStorage immediately to prevent race condition
    sessionStorage.removeItem('dialog_brand-basic-info');
    onOpenChange(false);
  };

  const handleClickOutside = () => {
    // Clear the draft when user clicks outside (implicit cancel)
    localStorage.removeItem(storageKey);
    // Clear sessionStorage immediately to prevent race condition
    sessionStorage.removeItem('dialog_brand-basic-info');
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
          <DialogTitle>Edit Basic Information</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
            <ImageUpload
              userId={user?.id || ""}
              currentImageUrl={formData.logo_url}
              onImageUpload={handleLogoUpload}
              size="md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="website.com"
            />
            <p className="text-xs text-muted-foreground">
              You can enter just the domain (e.g., website.com)
            </p>
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
