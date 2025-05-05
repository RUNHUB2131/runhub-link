
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RunClubProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
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

interface RunClubProfileFormProps {
  initialData?: Partial<RunClubProfile>;
  onSave?: (profile: Partial<RunClubProfile>) => Promise<void>;
}

export const RunClubProfileForm = ({ 
  initialData = {}, 
  onSave 
}: RunClubProfileFormProps) => {
  const [formData, setFormData] = useState({
    club_name: initialData.club_name || "",
    description: initialData.description || "",
    city: initialData.city || "",
    state: initialData.state || "",
    member_count: initialData.member_count || 0,
    average_group_size: initialData.average_group_size || 0,
    core_demographic: initialData.core_demographic || "",
    website: initialData.website || "",
    logo_url: initialData.logo_url || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Combine city and state into location for backward compatibility
      const dataToSave = {
        ...formData,
        location: formData.city && formData.state ? `${formData.city}, ${formData.state}` : undefined
      };
      
      if (onSave) {
        await onSave(dataToSave);
      } else {
        // Save to Supabase
        const { error } = await supabase
          .from('run_club_profiles')
          .update(dataToSave)
          .eq('id', user.id);
        
        if (error) throw error;
      }
      
      toast({
        title: "Profile saved",
        description: "Your run club profile has been updated successfully.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Run Club Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="club_name">Name *</Label>
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your run club"
              rows={5}
              required
            />
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
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Create Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
