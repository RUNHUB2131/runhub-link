
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    twitter: socialMedia.twitter || "",
    facebook: socialMedia.facebook || "",
    strava: socialMedia.strava || "",
    follower_count_range: socialMedia.follower_count_range || "" as FollowerCountRange | "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRangeChange = (value: FollowerCountRange) => {
    setFormData((prev) => ({
      ...prev,
      follower_count_range: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave({
        social_media: {
          instagram: formData.instagram,
          twitter: formData.twitter,
          facebook: formData.facebook,
          strava: formData.strava,
          follower_count_range: formData.follower_count_range as FollowerCountRange | undefined,
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving social media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Social Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Total Social Media Audience</Label>
            <RadioGroup
              value={formData.follower_count_range}
              onValueChange={handleRangeChange as (value: string) => void}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="under_1000" id="under_1000" />
                <Label htmlFor="under_1000">0 - 1,000 followers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1000_to_4000" id="1000_to_4000" />
                <Label htmlFor="1000_to_4000">1,000 - 4,000 followers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4000_to_9000" id="4000_to_9000" />
                <Label htmlFor="4000_to_9000">4,000 - 9,000 followers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9000_to_20000" id="9000_to_20000" />
                <Label htmlFor="9000_to_20000">9,000 - 20,000 followers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="over_20000" id="over_20000" />
                <Label htmlFor="over_20000">20,000+ followers</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="@yourusername"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="@yourusername"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="Your page name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="strava">Strava</Label>
            <Input
              id="strava"
              name="strava"
              value={formData.strava}
              onChange={handleChange}
              placeholder="Your club name"
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
