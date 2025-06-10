import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchRunClubs, getRunClubById, RunClubOption } from "@/services/runClubService";
import { useQuery } from "@tanstack/react-query";

interface RunClubSelectorProps {
  value: string | null;
  onChange: (clubId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const RunClubSelector = ({ 
  value, 
  onChange, 
  placeholder = "Select run club...",
  disabled = false 
}: RunClubSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Query for searching clubs
  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['runClubs', searchTerm],
    queryFn: () => searchRunClubs(searchTerm, 20),
    enabled: open || !!searchTerm
  });

  // Query for selected club details
  const { data: selectedClub } = useQuery({
    queryKey: ['runClub', value],
    queryFn: () => value ? getRunClubById(value) : null,
    enabled: !!value
  });

  const handleSelect = (clubId: string) => {
    onChange(clubId === value ? null : clubId);
    setOpen(false);
  };

  const displayValue = selectedClub 
    ? `${selectedClub.club_name}${selectedClub.city && selectedClub.state ? ` (${selectedClub.city}, ${selectedClub.state})` : ''}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search run clubs..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No run clubs found."}
            </CommandEmpty>
            <CommandGroup>
              {clubs.map((club) => {
                // Create a searchable value that includes only club name
                const searchableValue = club.club_name.toLowerCase();
                
                return (
                  <CommandItem
                    key={club.id}
                    value={searchableValue}
                    onSelect={() => handleSelect(club.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === club.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{club.club_name}</span>
                      {(club.city || club.state) && (
                        <span className="text-sm text-muted-foreground">
                          {club.city && club.state ? `${club.city}, ${club.state}` : club.city || club.state}
                          {club.member_count && ` • ${club.member_count} members`}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 