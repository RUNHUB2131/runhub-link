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
    location: initialData.location || "",
    member_count: initialData.member_count || 0,
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
      [name]: name === "member_count" ? parseInt(value) || 0 : value,
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
      // Ensure website starts with https://
      let website = formData.website.trim();
      if (website && !/^https?:\/\//i.test(website)) {
        website = 'https://' + website;
      }
      const dataToSave = { ...formData, website };
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
            <Label htmlFor="club_name">Name</Label>
            <Input
              id="club_name"
              name="club_name"
              value={formData.club_name}
              onChange={handleChange}
              placeholder="Your run club name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your run club"
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="member_count">Number of Members</Label>
            <Input
              id="member_count"
              name="member_count"
              type="number"
              value={formData.member_count}
              onChange={handleChange}
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://"
            />
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
