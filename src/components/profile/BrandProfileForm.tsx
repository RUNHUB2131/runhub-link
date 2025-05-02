
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BrandProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BrandProfileFormProps {
  initialData?: Partial<BrandProfile>;
  onSave?: (profile: Partial<BrandProfile>) => Promise<void>;
}

export const BrandProfileForm = ({ 
  initialData = {}, 
  onSave 
}: BrandProfileFormProps) => {
  const [formData, setFormData] = useState({
    company_name: initialData.company_name || "",
    industry: initialData.industry || "",
    description: initialData.description || "",
    website: initialData.website || "",
    logo_url: initialData.logo_url || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (onSave) {
        await onSave(formData);
      } else {
        // Mock save for now
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "Profile saved",
        description: "Your brand profile has been updated successfully.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Brand Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Your company name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g. Sports Apparel, Nutrition, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your brand"
              rows={5}
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
