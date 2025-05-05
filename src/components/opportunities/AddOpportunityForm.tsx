import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const AddOpportunityForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [requirements, setRequirements] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    deadline: "",
    duration: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create an opportunity",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Parse requirements into an array
      const requirementsArray = requirements
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "");
      
      // Save to Supabase
      const { error } = await supabase
        .from('opportunities')
        .insert({
          brand_id: user.id,
          title: formData.title,
          description: formData.description,
          reward: formData.reward,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          duration: formData.duration,
          requirements: requirementsArray
        });
      
      if (error) throw error;
      
      toast({
        title: "Opportunity created",
        description: "Your sponsorship opportunity has been successfully created.",
      });
      
      navigate("/opportunities");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to create opportunity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Sponsorship Opportunity</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Sponsorship title"
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
              placeholder="Describe what you're looking for"
              rows={4}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reward">Incentive</Label>
            <Input
              id="reward"
              name="reward"
              value={formData.reward}
              onChange={handleChange}
              placeholder="What you're offering (e.g. $500, free products)"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (comma separated)</Label>
            <Textarea
              id="requirements"
              name="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g. 1000+ followers, weekly runs, race participation"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Campaign Duration</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 3 months"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Opportunity"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
