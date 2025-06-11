import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const feedbackFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  feedbackType: z.string().min(1, "Please select a feedback type"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  onBack: () => void;
}

export const FeedbackForm = ({ onBack }: FeedbackFormProps) => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      feedbackType: "",
      subject: "",
      message: "",
    },
  });

  const feedbackTypes = [
    { value: "feature_request", label: "Feature Request" },
    { value: "improvement", label: "Improvement Suggestion" },
    { value: "positive", label: "Positive Feedback" },
    { value: "user_experience", label: "User Experience" },
    { value: "design", label: "Design Feedback" },
    { value: "general", label: "General Feedback" },
  ];

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    
    try {
      // Send feedback via Edge Function using Resend API
      const { data: response, error } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          name: data.name,
          email: data.email,
          feedbackType: data.feedbackType,
          subject: data.subject,
          message: data.message,
          userType: userType,
          userId: user?.id
        }
      });

      if (error) throw error;

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to send feedback');
      }

      toast({
        title: "Feedback sent!",
        description: "Thank you for helping us improve RUNHUB Connect!",
      });

      reset();
      onBack();
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Give us feedback</h1>
      </div>

      {/* Feedback Form */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Help us improve RUNHUB Connect</h2>
          <p className="text-sm text-gray-600">
            We're in our MVP phase and your feedback is invaluable! Share your thoughts, suggestions, or ideas to help us build a better platform.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Your full name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="your@email.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Feedback Type Field */}
          <div className="space-y-2">
            <Label htmlFor="feedbackType">Feedback Type *</Label>
            <Select onValueChange={(value) => setValue("feedbackType", value)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="What kind of feedback are you sharing?" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.feedbackType && (
              <p className="text-sm text-red-600">{errors.feedbackType.message}</p>
            )}
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              {...register("subject")}
              placeholder="Brief summary of your feedback"
              disabled={isSubmitting}
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Feedback *</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Share your thoughts, suggestions, or ideas..."
              rows={6}
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Feedback
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Info Message */}
      <Card className="p-4 bg-green-50 border-green-200">
        <p className="text-sm text-green-800">
          🚀 Your feedback helps us build features that matter most to running clubs and brands. Thank you for being part of our journey!
        </p>
      </Card>
    </div>
  );
}; 