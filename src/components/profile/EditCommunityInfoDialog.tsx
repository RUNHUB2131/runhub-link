
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
import { RunClubProfile } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

interface EditCommunityInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<RunClubProfile>;
  onSave: (data: Partial<RunClubProfile>) => Promise<void>;
}

export function EditCommunityInfoDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditCommunityInfoDialogProps) {
  const communityData = profile.community_data || {};
  const demographics = communityData.demographics || {};
  
  const initialRunTypes = Array.isArray(communityData.run_types) ? communityData.run_types : [];
  const initialEventExperience = Array.isArray(demographics.event_experience) ? demographics.event_experience : [];
  
  const [formData, setFormData] = useState({
    average_group_size: demographics.average_group_size || "",
    core_demographic: demographics.core_demographic || "",
  });
  
  const [runTypes, setRunTypes] = useState<string[]>(initialRunTypes);
  const [eventExperience, setEventExperience] = useState<string[]>(initialEventExperience);
  const [isLoading, setIsLoading] = useState(false);

  const availableRunTypes = ["Road", "Trail", "Track", "Urban"];
  const availableEventTypes = ["Races", "Charity Runs", "Sponsored Events", "Community Meetups"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRunTypeToggle = (value: string) => {
    setRunTypes(current =>
      current.includes(value)
        ? current.filter(type => type !== value)
        : [...current, value]
    );
  };

  const handleEventTypeToggle = (value: string) => {
    setEventExperience(current =>
      current.includes(value)
        ? current.filter(type => type !== value)
        : [...current, value]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave({
        community_data: {
          run_types: runTypes,
          demographics: {
            ...demographics,
            average_group_size: formData.average_group_size,
            core_demographic: formData.core_demographic,
            event_experience: eventExperience,
          },
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving community info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Community Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="average_group_size">Average Group Size</Label>
            <Input
              id="average_group_size"
              name="average_group_size"
              value={formData.average_group_size}
              onChange={handleChange}
              placeholder="e.g., 25 runners"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="core_demographic">Core Demographic</Label>
            <Input
              id="core_demographic"
              name="core_demographic"
              value={formData.core_demographic}
              onChange={handleChange}
              placeholder="e.g., 25-34 years"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Run Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableRunTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`run-type-${type}`}
                    checked={runTypes.includes(type)}
                    onCheckedChange={() => handleRunTypeToggle(type)}
                  />
                  <label
                    htmlFor={`run-type-${type}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Event Experience</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableEventTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`event-type-${type}`}
                    checked={eventExperience.includes(type)}
                    onCheckedChange={() => handleEventTypeToggle(type)}
                  />
                  <label
                    htmlFor={`event-type-${type}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type}
                  </label>
                </div>
              ))}
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
