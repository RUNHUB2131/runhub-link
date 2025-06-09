import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AUSTRALIAN_STATES } from "@/utils/states";
import { ensureUserProfile } from "@/utils/profileUtils";
import { RunClubSelector } from "./RunClubSelector";

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

interface FormErrors {
  [key: string]: string;
}

const FormSection = ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="border-b border-gray-200 pb-2">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const FormField = ({ 
  label, 
  name, 
  required = false, 
  description, 
  error, 
  children 
}: { 
  label: string, 
  name: string, 
  required?: boolean, 
  description?: string, 
  error?: string, 
  children: React.ReactNode 
}) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {description && (
      <p className="text-xs text-gray-500">{description}</p>
    )}
    {children}
    {error && (
      <div className="flex items-center gap-1 text-red-600 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

export const AddOpportunityForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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
    city: "",
    state: "",
    club_size_preference: "",
    online_reach_preference: "",
    additional_notes: "",
    submission_deadline: "",
    quotes_requested: false,
    is_targeted: false,
    target_run_club_id: null,
  });

  const [showObjectiveOther, setShowObjectiveOther] = useState(false);
  const [showMediaRequirements, setShowMediaRequirements] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.activation_overview.trim()) newErrors.activation_overview = "Activation overview is required";
    if (!formData.target_launch_date) newErrors.target_launch_date = "Target launch date is required";
    if (!formData.primary_objective) newErrors.primary_objective = "Primary objective is required";
    if (!formData.content_specifications.trim()) newErrors.content_specifications = "Content specifications are required";
    if (!formData.professional_media) newErrors.professional_media = "Professional media requirements must be specified";
    if (!formData.club_responsibilities.trim()) newErrors.club_responsibilities = "Club responsibilities are required";
    if (!formData.club_incentives.trim()) newErrors.club_incentives = "Club incentives are required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.club_size_preference) newErrors.club_size_preference = "Club size preference is required";
    if (!formData.online_reach_preference) newErrors.online_reach_preference = "Online reach preference is required";
    if (!formData.submission_deadline) newErrors.submission_deadline = "Submission deadline is required";

    // Conditional validation
    if (formData.primary_objective === "Other" && !formData.primary_objective_other.trim()) {
      newErrors.primary_objective_other = "Please specify the primary objective";
    }
    
    if (formData.professional_media !== "None" && !formData.media_requirements.trim()) {
      newErrors.media_requirements = "Please specify the media requirements";
    }

    // Date validation
    if (formData.target_launch_date && formData.submission_deadline) {
      const launchDate = new Date(formData.target_launch_date);
      const deadlineDate = new Date(formData.submission_deadline);
      if (deadlineDate >= launchDate) {
        newErrors.submission_deadline = "Submission deadline must be before the launch date";
      }
    }

    // Add targeted opportunity validation
    if (formData.is_targeted && !formData.target_run_club_id) {
      newErrors.target_run_club_id = "Please select a run club for targeted opportunities";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing - use functional update for stability
    setErrors(prev => {
      if (prev[name]) {
        return { ...prev, [name]: "" };
      }
      return prev;
    });

    // Handle conditional fields
    if (name === "primary_objective") {
      setShowObjectiveOther(value === "Other");
      if (value !== "Other") {
        setFormData(prev => ({ ...prev, primary_objective_other: "" }));
      }
    }
    
    if (name === "professional_media") {
      setShowMediaRequirements(value !== "None");
      if (value === "None") {
        setFormData(prev => ({ ...prev, media_requirements: "", quotes_requested: false }));
      }
    }
  };

  const handleTargetingChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_targeted: checked,
      target_run_club_id: checked ? prev.target_run_club_id : null
    }));
  };

  const handleRunClubChange = (clubId: string | null) => {
    setFormData(prev => ({
      ...prev,
      target_run_club_id: clubId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors below",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }

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
      // First, verify the user's profile and permissions
      console.log('Current user:', user);
      
      // Try to ensure the user profile exists
      const profileEnsured = await ensureUserProfile(user.id, 'brand');
      if (!profileEnsured) {
        throw new Error('Failed to verify or create your brand profile. Please try logging out and back in.');
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile check error:', profileError);
        throw new Error(`Profile verification failed: ${profileError.message}`);
      }

      if (!profileData) {
        throw new Error('User profile not found. Please contact support.');
      }

      if (profileData.user_type !== 'brand') {
        throw new Error(`Invalid user type: ${profileData.user_type}. Only brands can create opportunities.`);
      }

      console.log('Profile verified:', profileData);

      // Now attempt to create the opportunity
      const opportunityData = {
        brand_id: user.id,
        title: formData.title.trim(),
        activation_overview: formData.activation_overview.trim(),
        target_launch_date: formData.target_launch_date,
        primary_objective: formData.primary_objective,
        primary_objective_other: formData.primary_objective === "Other" ? formData.primary_objective_other.trim() : null,
        content_specifications: formData.content_specifications.trim(),
        professional_media: formData.professional_media,
        media_requirements: formData.professional_media !== "None" ? formData.media_requirements.trim() : null,
        club_responsibilities: formData.club_responsibilities.trim(),
        club_incentives: formData.club_incentives.trim(),
        geographic_locations: [formData.city.trim(), formData.state].filter(s => s),
        city: formData.city.trim(),
        state: formData.state,
        club_size_preference: formData.club_size_preference,
        online_reach_preference: formData.online_reach_preference,
        additional_notes: formData.additional_notes.trim() || null,
        submission_deadline: formData.submission_deadline,
        quotes_requested: formData.quotes_requested,
        quotes_requested_at: formData.quotes_requested ? new Date().toISOString() : null,
        target_run_club_id: formData.is_targeted ? formData.target_run_club_id : null,
      };

      console.log('Attempting to create opportunity with data:', opportunityData);

      const { data: newOpportunity, error } = await supabase
        .from("opportunities")
        .insert(opportunityData)
        .select()
        .single();
      
      if (error) {
        console.error('Opportunity creation error:', error);
        throw error;
      }

      // If quotes were requested, send notification email via Edge Function
      if (formData.quotes_requested && newOpportunity) {
        try {
          // Get brand profile for email
          const { data: brandProfile } = await supabase
            .from('brand_profiles')
            .select('company_name')
            .eq('id', user.id)
            .single();

          // Call the Edge Function to send quote request email
          const { data: edgeFunctionResult, error: edgeFunctionError } = await supabase.functions.invoke('send-quote-request', {
            body: {
              opportunity: newOpportunity,
              brandDetails: {
                company_name: brandProfile?.company_name || 'Unknown Company',
                contact_email: user.email || '',
              }
            }
          });

          if (edgeFunctionError) {
            throw edgeFunctionError;
          }

          toast({
            title: "Success!",
            description: "Your opportunity has been created and quote request sent to RUNHUB.",
          });
        } catch (emailError) {
          console.error('Failed to send quote request email:', emailError);
          toast({
            title: "Opportunity Created",
            description: "Your opportunity was created successfully, but there was an issue sending the quote request. Please contact support.",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Success!",
          description: "Your sponsorship opportunity has been created successfully.",
        });
      }
      
      navigate("/opportunities");
    } catch (error: any) {
      console.error('Full error details:', error);
      
      let errorMessage = "Failed to create opportunity. Please try again.";
      
      if (error.message?.includes('new row violates row-level security policy')) {
        errorMessage = "You don't have permission to create opportunities. Please ensure your account is properly set up as a brand account.";
      } else if (error.message?.includes('Profile verification failed')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error creating opportunity",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Create New Sponsorship Opportunity</CardTitle>
        <p className="text-gray-600">Fill out the details below to create a new sponsorship opportunity for run clubs.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Section */}
          <FormSection title="Basic Information">
            <FormField 
              label="Opportunity Title" 
              name="title" 
              required 
              description="A clear, descriptive title for your sponsorship opportunity"
              error={errors.title}
            >
              <Input 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g., Running gear partnership for weekly social runs" 
                className={errors.title ? "border-red-500" : ""}
              />
            </FormField>
          </FormSection>

          {/* Activation Details */}
          <FormSection 
            title="Activation Details" 
            description="Describe what the partnership involves and when it will happen"
          >
            <FormField 
              label="Activation Overview" 
              name="activation_overview" 
              required
              description="Provide a detailed description of what the activation involves"
              error={errors.activation_overview}
            >
              <Textarea 
                id="activation_overview" 
                name="activation_overview" 
                value={formData.activation_overview} 
                onChange={(e) => handleChange("activation_overview", e.target.value)}
                rows={4}
                placeholder="Describe the partnership, what activities are involved, and what you're looking to achieve..."
                className={errors.activation_overview ? "border-red-500" : ""}
              />
            </FormField>

            <FormField 
              label="Target Launch Date" 
              name="target_launch_date" 
              required
              description="When do you want this activation to begin?"
              error={errors.target_launch_date}
            >
              <DatePicker
                value={formData.target_launch_date}
                onChange={(value) => handleChange("target_launch_date", value)}
                placeholder="Select target launch date"
                className={errors.target_launch_date ? "border-red-500" : ""}
              />
            </FormField>

            <FormField 
              label="Primary Objective" 
              name="primary_objective" 
              required
              description="What is the main goal of this partnership?"
              error={errors.primary_objective}
            >
              <Select 
                value={formData.primary_objective} 
                onValueChange={(value) => handleChange("primary_objective", value)}
              >
                <SelectTrigger className={errors.primary_objective ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your primary objective" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {PRIMARY_OBJECTIVES.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {showObjectiveOther && (
              <FormField 
                label="Please specify your objective" 
                name="primary_objective_other" 
                required
                error={errors.primary_objective_other}
              >
                <Input 
                  id="primary_objective_other" 
                  name="primary_objective_other" 
                  value={formData.primary_objective_other} 
                  onChange={(e) => handleChange("primary_objective_other", e.target.value)}
                  placeholder="Describe your specific objective..."
                  className={errors.primary_objective_other ? "border-red-500" : ""}
                />
              </FormField>
            )}
          </FormSection>

          {/* Content Requirements */}
          <FormSection 
            title="Content Requirements" 
            description="Specify what content you need from the run club"
          >
            <FormField 
              label="Content Specifications" 
              name="content_specifications" 
              required
              description="What specific content do you need? (social media posts, photos, videos, etc.)"
              error={errors.content_specifications}
            >
              <Textarea 
                id="content_specifications" 
                name="content_specifications" 
                value={formData.content_specifications} 
                onChange={(e) => handleChange("content_specifications", e.target.value)}
                rows={3}
                placeholder="e.g., 3 Instagram posts featuring your product, 1 Instagram story per week, product photos during runs..."
                className={errors.content_specifications ? "border-red-500" : ""}
              />
            </FormField>

            <FormField 
              label="Professional Media Requirements" 
              name="professional_media" 
              required
              description="Do you require professional photography or videography?"
              error={errors.professional_media}
            >
              <Select 
                value={formData.professional_media} 
                onValueChange={(value) => handleChange("professional_media", value)}
              >
                <SelectTrigger className={errors.professional_media ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {PROFESSIONAL_MEDIA.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {showMediaRequirements && (
              <FormField 
                label="Specific Media Requirements" 
                name="media_requirements" 
                required
                description="Describe the specific photography or videography requirements"
                error={errors.media_requirements}
              >
                <Textarea 
                  id="media_requirements" 
                  name="media_requirements" 
                  value={formData.media_requirements} 
                  onChange={(e) => handleChange("media_requirements", e.target.value)}
                  rows={3}
                  placeholder="e.g., Professional photos of group wearing branded gear, short video clips for social media..."
                  className={errors.media_requirements ? "border-red-500" : ""}
                />
              </FormField>
            )}

            {/* Quote Request Checkbox - Only show if professional media is required */}
            {showMediaRequirements && (
              <div className="flex items-start space-x-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <Checkbox
                  id="quotes_requested"
                  checked={formData.quotes_requested}
                  onCheckedChange={(checked) => 
                    handleChange("quotes_requested", checked === true)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="quotes_requested"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Request RUNHUB to generate quotes
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Check this box if you'd like RUNHUB to provide 3 professional quotes 
                    for your professional media requirements. Our team will review your opportunity 
                    details and send quotes directly to your email.
                  </p>
                </div>
              </div>
            )}
          </FormSection>

          {/* Club Participation */}
          <FormSection 
            title="Club Participation" 
            description="Define what the club needs to do and what they'll receive"
          >
            <FormField 
              label="Club Responsibilities" 
              name="club_responsibilities" 
              required
              description="What specific actions does the run club need to take?"
              error={errors.club_responsibilities}
            >
              <Textarea 
                id="club_responsibilities" 
                name="club_responsibilities" 
                value={formData.club_responsibilities} 
                onChange={(e) => handleChange("club_responsibilities", e.target.value)}
                rows={3}
                placeholder="e.g., Wear branded gear during weekly runs, post photos on social media, attend product launch event..."
                className={errors.club_responsibilities ? "border-red-500" : ""}
              />
            </FormField>

            <FormField 
              label="Club Incentives" 
              name="club_incentives" 
              required
              description="What will the run club receive in return?"
              error={errors.club_incentives}
            >
              <Textarea 
                id="club_incentives" 
                name="club_incentives" 
                value={formData.club_incentives} 
                onChange={(e) => handleChange("club_incentives", e.target.value)}
                rows={3}
                placeholder="e.g., Free running gear for all members, $500 club funding, exclusive product access..."
                className={errors.club_incentives ? "border-red-500" : ""}
              />
            </FormField>
          </FormSection>

          {/* Target Club Criteria */}
          <FormSection 
            title="Target Club Criteria" 
            description="Specify what type of run clubs you're looking for"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="City" 
                name="city" 
                required
                description="Which city are you targeting?"
                error={errors.city}
              >
                <Input 
                  id="city" 
                  name="city" 
                  value={formData.city} 
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="e.g., Melbourne, Sydney, Brisbane"
                  className={errors.city ? "border-red-500" : ""}
                />
              </FormField>

              <FormField 
                label="State" 
                name="state" 
                required
                description="Which Australian state?"
                error={errors.state}
              >
                <Select value={formData.state} onValueChange={(value) => handleChange("state", value)}>
                  <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    {AUSTRALIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Club Size Preference" 
                name="club_size_preference" 
                required
                error={errors.club_size_preference}
              >
                <Select value={formData.club_size_preference} onValueChange={(value) => handleChange("club_size_preference", value)}>
                  <SelectTrigger className={errors.club_size_preference ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select preferred club size" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    {CLUB_SIZE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField 
                label="Online Reach Preference" 
                name="online_reach_preference" 
                required
                error={errors.online_reach_preference}
              >
                <Select value={formData.online_reach_preference} onValueChange={(value) => handleChange("online_reach_preference", value)}>
                  <SelectTrigger className={errors.online_reach_preference ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select preferred online reach" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    {ONLINE_REACH_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </FormSection>

          {/* Target Specific Club Section */}
          <FormSection 
            title="Opportunity Targeting" 
            description="Choose whether to send this opportunity to all clubs or a specific club"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_targeted"
                  checked={formData.is_targeted}
                  onCheckedChange={handleTargetingChange}
                />
                <label htmlFor="is_targeted" className="text-sm font-medium text-gray-700">
                  Send to specific run club only
                </label>
              </div>
              
              {formData.is_targeted && (
                <div className="space-y-3">
                  <FormField 
                    label="Select Run Club" 
                    name="target_run_club_id" 
                    required
                    error={errors.target_run_club_id}
                  >
                    <RunClubSelector
                      value={formData.target_run_club_id}
                      onChange={handleRunClubChange}
                      placeholder="Search and select a run club..."
                    />
                  </FormField>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This opportunity will only be visible to the selected run club. 
                      They will see it in a special "Just for you" section.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </FormSection>

          {/* Additional Information */}
          <FormSection 
            title="Additional Information" 
            description="Any other details or requirements"
          >
            <FormField 
              label="Additional Notes" 
              name="additional_notes"
              description="Any additional information or special requirements (optional)"
            >
              <Textarea 
                id="additional_notes" 
                name="additional_notes" 
                value={formData.additional_notes} 
                onChange={(e) => handleChange("additional_notes", e.target.value)}
                rows={3}
                placeholder="Any other important details..."
              />
            </FormField>

            <FormField 
              label="Application Deadline" 
              name="submission_deadline" 
              required
              description="When should run clubs submit their applications by?"
              error={errors.submission_deadline}
            >
              <DatePicker
                value={formData.submission_deadline}
                onChange={(value) => handleChange("submission_deadline", value)}
                placeholder="Select application deadline"
                className={errors.submission_deadline ? "border-red-500" : ""}
              />
            </FormField>
          </FormSection>

          {/* Submit Section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Once created, your opportunity will be visible to run clubs. You can only edit opportunities that haven't received applications yet.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/opportunities")}
                className="sm:w-auto w-full"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="sm:w-auto w-full bg-primary hover:bg-primary/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Opportunity...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Opportunity
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
