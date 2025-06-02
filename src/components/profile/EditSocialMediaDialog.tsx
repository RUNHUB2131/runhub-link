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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RunClubProfile, FollowerCountRange } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface EditSocialMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<RunClubProfile>;
  onSave: (data: Partial<RunClubProfile>) => Promise<void>;
}

export function EditSocialMediaDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditSocialMediaDialogProps) {
  const { user } = useAuth();
  const socialMedia = profile.social_media || {};
  
  const [formData, setFormData] = useState({
    instagram: socialMedia.instagram || "",
    instagram_follower_range: socialMedia.instagram_follower_range || undefined,
    tiktok: socialMedia.tiktok || "",
    tiktok_follower_range: socialMedia.tiktok_follower_range || undefined,
    facebook: socialMedia.facebook || "",
    facebook_follower_range: socialMedia.facebook_follower_range || undefined,
    strava: socialMedia.strava || "",
    strava_follower_range: socialMedia.strava_follower_range || undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Create a unique key for localStorage based on user ID and dialog type
  const storageKey = `editSocialMedia_${user?.id}_draft`;

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
          const socialMedia = profile.social_media || {};
          setFormData({
            instagram: socialMedia.instagram || "",
            instagram_follower_range: socialMedia.instagram_follower_range || undefined,
            tiktok: socialMedia.tiktok || "",
            tiktok_follower_range: socialMedia.tiktok_follower_range || undefined,
            facebook: socialMedia.facebook || "",
            facebook_follower_range: socialMedia.facebook_follower_range || undefined,
            strava: socialMedia.strava || "",
            strava_follower_range: socialMedia.strava_follower_range || undefined,
          });
        }
      } else {
        // No draft exists, use current profile data
        const socialMedia = profile.social_media || {};
        setFormData({
          instagram: socialMedia.instagram || "",
          instagram_follower_range: socialMedia.instagram_follower_range || undefined,
          tiktok: socialMedia.tiktok || "",
          tiktok_follower_range: socialMedia.tiktok_follower_range || undefined,
          facebook: socialMedia.facebook || "",
          facebook_follower_range: socialMedia.facebook_follower_range || undefined,
          strava: socialMedia.strava || "",
          strava_follower_range: socialMedia.strava_follower_range || undefined,
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
      [name]: value,
    }));
  };

  const handleRangeChange = (platform: string, value: FollowerCountRange | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [`${platform}_follower_range`]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave({
        social_media: {
          instagram: formData.instagram,
          instagram_follower_range: formData.instagram_follower_range,
          tiktok: formData.tiktok,
          tiktok_follower_range: formData.tiktok_follower_range,
          facebook: formData.facebook,
          facebook_follower_range: formData.facebook_follower_range,
          strava: formData.strava,
          strava_follower_range: formData.strava_follower_range,
        },
      });
      // Clear the draft after successful save
      localStorage.removeItem(storageKey);
      // Clear sessionStorage immediately to prevent race condition
      sessionStorage.removeItem('dialog_runclub-social-media');
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
    // Clear sessionStorage immediately to prevent race condition
    sessionStorage.removeItem('dialog_runclub-social-media');
    onOpenChange(false);
  };

  const handleClickOutside = () => {
    // Clear the draft when user clicks outside (implicit cancel)
    localStorage.removeItem(storageKey);
    // Clear sessionStorage immediately to prevent race condition
    sessionStorage.removeItem('dialog_runclub-social-media');
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Dialog is being closed - clear the draft (same as cancel)
      localStorage.removeItem(storageKey);
    }
    onOpenChange(open);
  };

  const followerRangeOptions = [
    { value: "under_1000", label: "0 - 1,000 followers" },
    { value: "1000_to_4000", label: "1,000 - 4,000 followers" },
    { value: "4000_to_9000", label: "4,000 - 9,000 followers" },
    { value: "9000_to_20000", label: "9,000 - 20,000 followers" },
    { value: "over_20000", label: "20,000+ followers" },
  ];

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
          <DialogTitle>Edit Social Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@yourusername"
                />
                <Select
                  value={formData.instagram_follower_range}
                  onValueChange={(value) => handleRangeChange('instagram', value as FollowerCountRange)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Follower count" />
                  </SelectTrigger>
                  <SelectContent>
                    {followerRangeOptions.map((option) => (
                      <SelectItem key={`instagram-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  id="tiktok"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleChange}
                  placeholder="@yourusername"
                />
                <Select
                  value={formData.tiktok_follower_range}
                  onValueChange={(value) => handleRangeChange('tiktok', value as FollowerCountRange)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Follower count" />
                  </SelectTrigger>
                  <SelectContent>
                    {followerRangeOptions.map((option) => (
                      <SelectItem key={`tiktok-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="Your page name"
                />
                <Select
                  value={formData.facebook_follower_range}
                  onValueChange={(value) => handleRangeChange('facebook', value as FollowerCountRange)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Follower count" />
                  </SelectTrigger>
                  <SelectContent>
                    {followerRangeOptions.map((option) => (
                      <SelectItem key={`facebook-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="strava">Strava</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  id="strava"
                  name="strava"
                  value={formData.strava}
                  onChange={handleChange}
                  placeholder="Your club name"
                />
                <Select
                  value={formData.strava_follower_range}
                  onValueChange={(value) => handleRangeChange('strava', value as FollowerCountRange)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Follower count" />
                  </SelectTrigger>
                  <SelectContent>
                    {followerRangeOptions.map((option) => (
                      <SelectItem key={`strava-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
