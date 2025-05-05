
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RunTypeSelectionProps {
  availableRunTypes: string[];
  selectedRunTypes: string[];
  onRunTypeToggle: (value: string) => void;
}

export function RunTypeSelection({
  availableRunTypes,
  selectedRunTypes,
  onRunTypeToggle,
}: RunTypeSelectionProps) {
  return (
    <div className="space-y-3">
      <Label>Run Types</Label>
      <div className="grid grid-cols-2 gap-2">
        {availableRunTypes.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`run-type-${type}`}
              checked={selectedRunTypes.includes(type)}
              onCheckedChange={() => onRunTypeToggle(type)}
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
  );
}
