import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value: string; // Keep as string for compatibility
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: DatePickerProps) {
  // Convert string value to Date for calendar, handle empty values
  const selectedDate = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  
  // Separate state for calendar month navigation (this is the key fix!)
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(
    selectedDate || new Date()
  );

  // Handle date selection - only changes the form value
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange("");
    }
    // Don't change calendar month when selecting date
  };

  // Handle month navigation - only changes the calendar view
  const handleMonthChange = (month: Date) => {
    setCalendarMonth(month);
    // Don't change selected date when navigating months
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(selectedDate!, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          month={calendarMonth}
          onMonthChange={handleMonthChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
} 