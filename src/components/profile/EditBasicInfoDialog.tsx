
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Australian states
const AUSTRALIAN_STATES = [
  "ACT",
  "NSW",
  "NT",
  "QLD",
  "SA",
  "TAS",
  "VIC",
  "WA",
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
    member_count: profile.member_count || 0,
    average_group_size: profile.average_group_size || 0,
    core_demographic: profile.core_demographic || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "member_count" || name === "average_group_size" 
        ? parseInt(value) || 0 
        : value,
    }));
  };

  const handleStateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      state: value
    }));
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    
    // Only add https:// if there isn't already a protocol
    if (value && value.trim() !== "" && !value.match(/^https?:\/\//)) {
      value = `https://${value}`;
    }
    
    setFormData(prev => ({
      ...prev,
      website: value
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
      // Combine city and state into location for backward compatibility
      const dataToSave = {
        ...formData,
        location: formData.city && formData.state ? `${formData.city}, ${formData.state}` : undefined
      };
      
      await onSave(dataToSave);
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
            <Label htmlFor="club_name">Club Name *</Label>
            <Input
              id="club_name"
              name="club_name"
              value={formData.club_name}
              onChange={handleChange}
              placeholder="Your run club name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select 
                value={formData.state} 
                onValueChange={handleStateChange}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {AUSTRALIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="member_count">Total Member Count *</Label>
            <Input
              id="member_count"
              name="member_count"
              type="number"
              value={formData.member_count}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="average_group_size">Average Group Size *</Label>
            <Input
              id="average_group_size"
              name="average_group_size"
              type="number"
              value={formData.average_group_size}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="core_demographic">Core Demographic *</Label>
            <Input
              id="core_demographic"
              name="core_demographic"
              value={formData.core_demographic}
              onChange={handleChange}
              placeholder="e.g., Women 25-40, Mixed all ages, etc."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleWebsiteChange}
              placeholder="yourwebsite.com"
            />
            <p className="text-xs text-muted-foreground">
              https:// will be added automatically if not included
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
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
