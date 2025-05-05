
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
  SelectValue 
} from "@/components/ui/select";

const AUSTRALIAN_STATES = [
  { value: "ACT", label: "ACT" },
  { value: "NSW", label: "NSW" },
  { value: "NT", label: "NT" },
  { value: "QLD", label: "QLD" },
  { value: "SA", label: "SA" },
  { value: "TAS", label: "TAS" },
  { value: "VIC", label: "VIC" },
  { value: "WA", label: "WA" },
];

// Community info constants
const GROUP_SIZE_RANGES = ["0-10", "10-25", "25-50", "50-100", "100-200", "200+"];
const DEMOGRAPHIC_RANGES = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

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
    website: initialData.website || "",
    logo_url: initialData.logo_url || "",
    
    // Community info fields
    member_count: initialData.member_count || 0,
    average_group_size: initialData.average_group_size || "",
    core_demographic: initialData.core_demographic || "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "member_count" ? parseInt(value) || 0 : value,
    }));
  };

  const handleStateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      state: value
    }));
  };

  const handleCoreDemographicChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      core_demographic: value
    }));
  };

  const handleAverageGroupSizeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      average_group_size: value
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
      // Process website URL before saving
      let dataToSave = { ...formData };
      if (dataToSave.website && !dataToSave.website.match(/^https?:\/\//)) {
        dataToSave.website = `https://${dataToSave.website}`;
      }

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
            <Label htmlFor="club_name">Club Name*</Label>
            <Input
              id="club_name"
              name="club_name"
              value={formData.club_name}
              onChange={handleChange}
              placeholder="Your run club name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City*</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State*</Label>
              <Select 
                value={formData.state} 
                onValueChange={handleStateChange}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {AUSTRALIAN_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description*</Label>
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
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="yourwebsite.com"
            />
            <p className="text-xs text-muted-foreground">https:// will be added automatically if not included</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              placeholder="https://"
            />
          </div>

          <div className="border-t pt-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">Community Information</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="member_count">Total Member Count*</Label>
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
                <Label htmlFor="average_group_size">Average Group Size*</Label>
                <Select
                  value={formData.average_group_size.toString()}
                  onValueChange={handleAverageGroupSizeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select average group size range" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_SIZE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="core_demographic">Core Demographic*</Label>
                <Select
                  value={formData.core_demographic}
                  onValueChange={handleCoreDemographicChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select core demographic age range" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMOGRAPHIC_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
