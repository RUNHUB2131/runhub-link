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

const PRIMARY_OBJECTIVES = [
  "Brand awareness",
  "Product trial",
  "Community building",
  "Online reach",
  "Other",
];
const PROFESSIONAL_MEDIA = ["None", "Photography", "Videography", "Both"];
const CLUB_SIZE_OPTIONS = [
  "< 10 attendees",
  "10-25 attendees",
  "25-50 attendees",
  "50-100 attendees",
  "100+ attendees",
  "No preference",
];
const ONLINE_REACH_OPTIONS = [
  "< 1K followers",
  "1K-4K followers",
  "4K-9K followers",
  "9K-20K followers",
  "20K+ followers",
  "No preference",
];

export const AddOpportunityForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    activation_overview: "",
    target_launch_date: "",
    primary_objective: "",
    primary_objective_other: "",
    content_specifications: "",
    professional_media: "None",
    media_requirements: "",
    club_responsibilities: "",
    club_incentives: "",
    geographic_locations: "",
    club_size_preference: "",
    online_reach_preference: "",
    additional_notes: "",
    submission_deadline: "",
  });

  const [showObjectiveOther, setShowObjectiveOther] = useState(false);
  const [showMediaRequirements, setShowMediaRequirements] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "primary_objective") {
      setShowObjectiveOther(value === "Other");
    }
    if (name === "professional_media") {
      setShowMediaRequirements(value !== "None");
    }
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
    // Validation
    if (!formData.title || !formData.activation_overview || !formData.target_launch_date || !formData.primary_objective || !formData.content_specifications || !formData.professional_media || !formData.club_responsibilities || !formData.club_incentives || !formData.geographic_locations || !formData.club_size_preference || !formData.online_reach_preference || !formData.submission_deadline) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (formData.primary_objective === "Other" && !formData.primary_objective_other) {
      toast({
        title: "Missing objective detail",
        description: "Please specify the primary objective.",
        variant: "destructive",
      });
      return;
    }
    if (formData.professional_media !== "None" && !formData.media_requirements) {
      toast({
        title: "Missing media requirements",
        description: "Please specify the media requirements.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from("opportunities").insert({
        brand_id: user.id,
        title: formData.title,
        activation_overview: formData.activation_overview,
        target_launch_date: formData.target_launch_date,
        primary_objective: formData.primary_objective,
        primary_objective_other: formData.primary_objective === "Other" ? formData.primary_objective_other : null,
        content_specifications: formData.content_specifications,
        professional_media: formData.professional_media,
        media_requirements: formData.professional_media !== "None" ? formData.media_requirements : null,
        club_responsibilities: formData.club_responsibilities,
        club_incentives: formData.club_incentives,
        geographic_locations: formData.geographic_locations.split(",").map((s) => s.trim()),
        club_size_preference: formData.club_size_preference,
        online_reach_preference: formData.online_reach_preference,
        additional_notes: formData.additional_notes || null,
        submission_deadline: formData.submission_deadline,
      });
      if (error) throw error;
      toast({
        title: "Opportunity created",
        description: "Your sponsorship opportunity has been successfully created.",
      });
      navigate("/opportunities");
    } catch (error: any) {
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
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter a title for your activation or event" />
          </div>
          {/* 2. Activation Details */}
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Activation Details</h2>
            <Label htmlFor="activation_overview">Activation Overview *</Label>
            <Textarea id="activation_overview" name="activation_overview" value={formData.activation_overview} onChange={handleChange} required rows={3} />
            <Label htmlFor="target_launch_date">Target Launch Date *</Label>
            <Input id="target_launch_date" name="target_launch_date" type="date" value={formData.target_launch_date} onChange={handleChange} required />
            <Label htmlFor="primary_objective">Primary Objective *</Label>
            <select id="primary_objective" name="primary_objective" value={formData.primary_objective} onChange={handleChange} required className="w-full border rounded p-2">
              <option value="">Select objective</option>
              {PRIMARY_OBJECTIVES.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {showObjectiveOther && (
              <div>
                <Label htmlFor="primary_objective_other">Please specify</Label>
                <Input id="primary_objective_other" name="primary_objective_other" value={formData.primary_objective_other} onChange={handleChange} required={showObjectiveOther} />
              </div>
            )}
          </div>
          {/* 3. Content Requirements */}
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Content Requirements</h2>
            <Label htmlFor="content_specifications">Content Specifications *</Label>
            <Textarea id="content_specifications" name="content_specifications" value={formData.content_specifications} onChange={handleChange} required rows={2} />
            <Label htmlFor="professional_media">Professional Media Requirements *</Label>
            <select id="professional_media" name="professional_media" value={formData.professional_media} onChange={handleChange} required className="w-full border rounded p-2">
              {PROFESSIONAL_MEDIA.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {showMediaRequirements && (
              <div>
                <Label htmlFor="media_requirements">Specific Media Requirements</Label>
                <Textarea id="media_requirements" name="media_requirements" value={formData.media_requirements} onChange={handleChange} required={showMediaRequirements} rows={2} />
              </div>
            )}
          </div>
          {/* 4. Club Participation */}
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Club Participation</h2>
            <Label htmlFor="club_responsibilities">Club Responsibilities *</Label>
            <Textarea id="club_responsibilities" name="club_responsibilities" value={formData.club_responsibilities} onChange={handleChange} required rows={2} />
            <Label htmlFor="club_incentives">Club Incentives *</Label>
            <Textarea id="club_incentives" name="club_incentives" value={formData.club_incentives} onChange={handleChange} required rows={2} />
          </div>
          {/* 5. Target Club Criteria */}
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Target Club Criteria</h2>
            <Label htmlFor="geographic_locations">Geographic Locations *</Label>
            <Input id="geographic_locations" name="geographic_locations" value={formData.geographic_locations} onChange={handleChange} placeholder="e.g. Gold Coast, Sydney, Melbourne" required />
            <Label htmlFor="club_size_preference">Club Size Preference *</Label>
            <select id="club_size_preference" name="club_size_preference" value={formData.club_size_preference} onChange={handleChange} required className="w-full border rounded p-2">
              <option value="">Select size</option>
              {CLUB_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <Label htmlFor="online_reach_preference">Online Reach Preference *</Label>
            <select id="online_reach_preference" name="online_reach_preference" value={formData.online_reach_preference} onChange={handleChange} required className="w-full border rounded p-2">
              <option value="">Select reach</option>
              {ONLINE_REACH_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* 6. Additional Notes */}
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Additional Notes</h2>
            <Textarea id="additional_notes" name="additional_notes" value={formData.additional_notes} onChange={handleChange} rows={2} />
          </div>
          {/* Submission Section */}
          <div className="space-y-2">
            <Label htmlFor="submission_deadline">Submission Deadline *</Label>
            <Input id="submission_deadline" name="submission_deadline" type="date" value={formData.submission_deadline} onChange={handleChange} required />
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <p>Thank you for submitting your opportunity! For questions, contact <a href="mailto:hello@runhub.com" className="text-blue-600 underline">hello@runhub.com</a>.</p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Opportunity"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
