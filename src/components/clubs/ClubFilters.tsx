import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Search, Filter, X, MapPin, Users, TrendingUp, Heart } from "lucide-react";
import { ClubFilters as ClubFiltersType } from "@/services/clubService";
import { FollowerCountRange } from "@/types";

interface ClubFiltersProps {
  filters: ClubFiltersType;
  onFiltersChange: (filters: Partial<ClubFiltersType>) => void;
  onClearFilters: () => void;
  availableStates: string[];
  isLoading?: boolean;
}

const followerRangeOptions: { value: FollowerCountRange; label: string }[] = [
  { value: 'under_1000', label: 'Under 1K' },
  { value: '1000_to_4000', label: '1K - 4K' },
  { value: '4000_to_9000', label: '4K - 9K' },
  { value: '9000_to_20000', label: '9K - 20K' },
  { value: 'over_20000', label: '20K+' },
];

export const ClubFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableStates,
  isLoading
}: ClubFiltersProps) => {
  const [searchText, setSearchText] = useState(filters.searchText || "");
  const [memberCountRange, setMemberCountRange] = useState<[number, number]>([
    filters.minMemberCount || 0,
    filters.maxMemberCount || 1000
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ searchText: searchText.trim() });
  };

  const handleMemberCountChange = (values: [number, number]) => {
    setMemberCountRange(values);
    onFiltersChange({
      minMemberCount: values[0],
      maxMemberCount: values[1]
    });
  };

  const handleStateChange = (value: string) => {
    onFiltersChange({ state: value === "ALL_STATES" ? undefined : value });
  };

  const handleFollowerRangeChange = (value: string) => {
    onFiltersChange({ 
      followerRange: value === "ALL_FOLLOWERS" ? undefined : (value as FollowerCountRange)
    });
  };

  const hasActiveFilters = !!(
    filters.state ||
    filters.minMemberCount ||
    filters.maxMemberCount ||
    filters.followerRange ||
    filters.searchText ||
    filters.showFavoritesOnly
  );

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-background to-muted/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Filter Clubs</CardTitle>
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Search and Favorites Row */}
          <div className="flex gap-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by club name or city..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10 h-10"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="px-6">
                Search
              </Button>
            </form>
            
            {/* Favorites Toggle */}
            <div className="flex items-center gap-3 px-4 py-2 border rounded-lg bg-background">
              <Heart className="h-4 w-4 text-red-500" />
              <Label htmlFor="favorites-toggle" className="text-sm font-medium cursor-pointer">
                Favorites only
              </Label>
              <Switch
                id="favorites-toggle"
                checked={filters.showFavoritesOnly || false}
                onCheckedChange={(checked) => onFiltersChange({ showFavoritesOnly: checked })}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* State Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">State</Label>
              </div>
              <Select
                value={filters.state || "ALL_STATES"}
                onValueChange={handleStateChange}
                disabled={isLoading}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_STATES">All states</SelectItem>
                  {availableStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Member Count Range */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">
                  Members: {memberCountRange[0]} - {memberCountRange[1] >= 1000 ? '1000+' : memberCountRange[1]}
                </Label>
              </div>
              <div className="px-1">
                <Slider
                  value={memberCountRange}
                  onValueChange={handleMemberCountChange}
                  max={1000}
                  min={0}
                  step={25}
                  className="w-full"
                  disabled={isLoading}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>1000+</span>
                </div>
              </div>
            </div>

            {/* Follower Count Range */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Social Followers</Label>
              </div>
              <Select
                value={filters.followerRange || "ALL_FOLLOWERS"}
                onValueChange={handleFollowerRangeChange}
                disabled={isLoading}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Any follower count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_FOLLOWERS">Any follower count</SelectItem>
                  {followerRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} followers
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClubFilters; 