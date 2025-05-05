
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const AUSTRALIAN_STATES = [
  { value: "ACT", label: "ACT" },
  { value: "NSW", label: "NSW" },
  { value: "NT", label: "NT" },
  { value: "QLD", label: "QLD" },
  { value: "SA", label: "SA" },
  { value: "TAS", label: "TAS" },
  { value: "VIC", label: "VIC" },
  { value: "WA", label: "WA" },
];

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
    city: profile.city || "",
    state: profile.state || "",
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

  const handleStateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      state: value
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
      // Process website URL before saving
      let websiteWithProtocol = formData.website;
      if (websiteWithProtocol && !websiteWithProtocol.match(/^https?:\/\//)) {
        websiteWithProtocol = `https://${websiteWithProtocol}`;
      }

      await onSave({
        ...formData,
        website: websiteWithProtocol
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Update form data when profile changes
    if (open) {
      setFormData({
        club_name: profile.club_name || "",
        description: profile.description || "",
        city: profile.city || "",
        state: profile.state || "",
        website: profile.website || "",
        logo_url: profile.logo_url || "",
      });
    }
  }, [profile, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Basic Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-center mb-4">
            <ImageUpload 
              userId={user?.id || ''}
              currentImageUrl={formData.logo_url}
              onImageUpload={handleLogoUpload}
              size="lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="club_name">Club Name*</Label>
            <Input
              id="club_name"
              name="club_name"
              value={formData.club_name}
              onChange={handleChange}
              placeholder="Your run club name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City*</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State*</Label>
              <Select 
                value={formData.state} 
                onValueChange={handleStateChange}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {AUSTRALIAN_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="yourwebsite.com"
            />
            <p className="text-xs text-muted-foreground">https:// will be added automatically if not included</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description*</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your run club"
              rows={4}
              required
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
