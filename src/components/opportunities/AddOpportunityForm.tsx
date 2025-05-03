
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity } from "@/types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const opportunitySchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  reward: z.string().min(1, { message: "Reward is required" }),
  deadline: z.date().optional(),
  duration: z.string().optional(),
  requirements: z.array(z.string()).optional(),
});

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

interface AddOpportunityFormProps {
  onSuccess?: () => void;
  initialValues?: Opportunity;
  isEditing?: boolean;
}

export const AddOpportunityForm = ({ 
  onSuccess, 
  initialValues,
  isEditing = false
}: AddOpportunityFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default values based on initialValues if provided
  const defaultValues = initialValues 
    ? {
        ...initialValues,
        deadline: initialValues.deadline ? new Date(initialValues.deadline) : undefined,
      }
    : {
        title: "",
        description: "",
        reward: "",
      };

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues,
  });

  const onSubmit = async (data: OpportunityFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create an opportunity.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const opportunityData = {
        ...data,
        brand_id: user.id,
        // Convert Date object to ISO string for the database
        deadline: data.deadline ? data.deadline.toISOString() : null
      };

      let result;

      if (isEditing && initialValues) {
        const { error } = await supabase
          .from("opportunities")
          .update(opportunityData)
          .eq("id", initialValues.id);

        if (error) throw error;
        
        result = { success: true };
      } else {
        const { data: insertData, error } = await supabase
          .from("opportunities")
          .insert([opportunityData])
          .select()
          .single();

        if (error) throw error;
        
        result = { success: true, data: insertData };
      }

      if (result.success) {
        toast({
          title: isEditing ? "Opportunity updated" : "Opportunity created",
          description: isEditing 
            ? "Your opportunity has been updated successfully."
            : "Your opportunity has been created successfully.",
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        if (!isEditing) {
          form.reset();
        }
      }
    } catch (error: any) {
      console.error("Error submitting opportunity:", error);
      toast({
        title: "Error",
        description: isEditing 
          ? "Failed to update opportunity. Please try again."
          : "Failed to create opportunity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter opportunity title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the opportunity in detail" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward</FormLabel>
              <FormControl>
                <Input placeholder="e.g. $500, free products, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 2 weeks, 1 month" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Deadline (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? (
            "Processing..."
          ) : isEditing ? (
            "Update Opportunity"
          ) : (
            "Create Opportunity"
          )}
        </Button>
      </form>
    </Form>
  );
};
