
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface DemographicSelectionsProps {
  memberCount: number;
  averageGroupSize: string;
  coreDemographic: string;
  groupSizeRanges: string[];
  demographicRanges: string[];
  onMemberCountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGroupSizeChange: (value: string) => void;
  onDemographicChange: (value: string) => void;
}

export function DemographicSelections({
  memberCount,
  averageGroupSize,
  coreDemographic,
  groupSizeRanges,
  demographicRanges,
  onMemberCountChange,
  onGroupSizeChange,
  onDemographicChange,
}: DemographicSelectionsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="member_count">Total Member Count*</Label>
        <Input
          id="member_count"
          name="member_count"
          type="number"
          value={memberCount}
          onChange={onMemberCountChange}
          min="0"
          placeholder="Enter total number of members"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="average_group_size">Average Group Size*</Label>
        <Select
          value={averageGroupSize}
          onValueChange={onGroupSizeChange}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select average group size range" />
          </SelectTrigger>
          <SelectContent>
            {groupSizeRanges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="core_demographic">Core Demographic (Age)*</Label>
        <Select
          value={coreDemographic}
          onValueChange={onDemographicChange}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select core demographic age range" />
          </SelectTrigger>
          <SelectContent>
            {demographicRanges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
