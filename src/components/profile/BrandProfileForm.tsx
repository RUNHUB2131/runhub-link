import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { BrandProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ImageUpload } from "@/components/ui/image-upload";

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
    open_to_pitches: initialData.open_to_pitches || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      logo_url: url
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
      if (onSave) {
        await onSave(formData);
      } else {
        // First ensure the base profile exists
        console.log('Ensuring base profile exists for user:', user.id);
        
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .maybeSingle();

        if (profileCheckError) {
          console.error('Error checking profile:', profileCheckError);
          throw new Error('Failed to check user profile');
        }

        // If no base profile exists, create it
        if (!existingProfile) {
          console.log('Creating base profile...');
          const { error: profileCreateError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              user_type: 'brand'
            });

          if (profileCreateError) {
            console.error('Error creating base profile:', profileCreateError);
            throw new Error('Failed to create base profile');
          }
        }

        // Now try to upsert the brand profile
        console.log('Upserting brand profile with data:', { id: user.id, ...formData });
        
        const { error, data } = await supabase
          .from('brand_profiles')
          .upsert({
            id: user.id,
            ...formData
          }, {
            onConflict: 'id'
          })
          .select();
        
        if (error) {
          console.error('Brand profile upsert error:', error);
          throw error;
        }
        
        console.log('Brand profile saved successfully:', data);
      }
      
      toast({
        title: "Profile saved",
        description: "Your brand profile has been updated successfully.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Full error details:', error);
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
        <CardTitle>Create Brand Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-4">
            <ImageUpload 
              userId={user?.id || ''}
              currentImageUrl={formData.logo_url}
              onImageUpload={handleLogoUpload}
              size="lg"
            />
          </div>
          
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
              placeholder="website.com"
            />
            <p className="text-xs text-muted-foreground">
              You can enter just the domain (e.g., website.com)
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="open_to_pitches"
              checked={formData.open_to_pitches}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, open_to_pitches: !!checked }))
              }
            />
            <Label htmlFor="open_to_pitches" className="text-sm">
              I'm open to receiving sponsorship pitches from run clubs
            </Label>
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
