
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RunClubProfile, FollowerCountRange } from "@/types";

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
  const socialMedia = profile.social_media || {};
  
  const [formData, setFormData] = useState({
    instagram: socialMedia.instagram || "",
    instagram_follower_range: socialMedia.instagram_follower_range || undefined,
    twitter: socialMedia.twitter || "",
    twitter_follower_range: socialMedia.twitter_follower_range || undefined,
    facebook: socialMedia.facebook || "",
    facebook_follower_range: socialMedia.facebook_follower_range || undefined,
    strava: socialMedia.strava || "",
    strava_follower_range: socialMedia.strava_follower_range || undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

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
          twitter: formData.twitter,
          twitter_follower_range: formData.twitter_follower_range,
          facebook: formData.facebook,
          facebook_follower_range: formData.facebook_follower_range,
          strava: formData.strava,
          strava_follower_range: formData.strava_follower_range,
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving social media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const followerRangeOptions = [
    { value: "under_1000", label: "0 - 1,000 followers" },
    { value: "1000_to_4000", label: "1,000 - 4,000 followers" },
    { value: "4000_to_9000", label: "4,000 - 9,000 followers" },
    { value: "9000_to_20000", label: "9,000 - 20,000 followers" },
    { value: "over_20000", label: "20,000+ followers" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
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
              <Label htmlFor="twitter">Twitter</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="@yourusername"
                />
                <Select
                  value={formData.twitter_follower_range}
                  onValueChange={(value) => handleRangeChange('twitter', value as FollowerCountRange)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Follower count" />
                  </SelectTrigger>
                  <SelectContent>
                    {followerRangeOptions.map((option) => (
                      <SelectItem key={`twitter-${option.value}`} value={option.value}>
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
