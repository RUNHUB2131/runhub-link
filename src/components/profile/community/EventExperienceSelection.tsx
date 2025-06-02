import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EventExperienceSelectionProps {
  availableEventTypes: string[];
  selectedEventTypes: string[];
  onEventTypeToggle: (value: string) => void;
}

export function EventExperienceSelection({
  availableEventTypes,
  selectedEventTypes,
  onEventTypeToggle,
}: EventExperienceSelectionProps) {
  return (
    <div className="space-y-3">
      <Label>Activation Experience</Label>
      <div className="grid grid-cols-2 gap-2">
        {availableEventTypes.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`event-type-${type}`}
              checked={selectedEventTypes.includes(type)}
              onCheckedChange={() => onEventTypeToggle(type)}
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
  );
}
