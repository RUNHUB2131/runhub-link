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
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  issueType: z.string().min(1, "Please select an issue type"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactSupportFormProps {
  onBack: () => void;
}

export const ContactSupportForm = ({ onBack }: ContactSupportFormProps) => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      issueType: "",
      subject: "",
      message: "",
    },
  });

  const issueTypes = [
    { value: "technical", label: "Technical Issue" },
    { value: "account", label: "Account Problem" },
    { value: "billing", label: "Billing Question" },
    { value: "partnership", label: "Partnership Issue" },
    { value: "feature", label: "Feature Request" },
    { value: "bug", label: "Bug Report" },
    { value: "other", label: "Other" },
  ];

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Send email via Edge Function using Resend API
      const { data: response, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: data.name,
          email: data.email,
          issueType: data.issueType,
          subject: data.subject,
          message: data.message,
          userType: userType,
          userId: user?.id
        }
      });

      if (error) throw error;

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to send email');
      }

      toast({
        title: "Message sent!",
        description: "We've received your message and will get back to you soon.",
      });

      reset();
      onBack();
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
        <h1 className="text-2xl font-bold">Contact Support</h1>
      </div>

      {/* Contact Form */}
      <Card className="p-6">
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

          {/* Issue Type Field */}
          <div className="space-y-2">
            <Label htmlFor="issueType">Issue Type *</Label>
            <Select onValueChange={(value) => setValue("issueType", value)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.issueType && (
              <p className="text-sm text-red-600">{errors.issueType.message}</p>
            )}
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              {...register("subject")}
              placeholder="Brief description of your issue"
              disabled={isSubmitting}
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Please describe your issue or question in detail..."
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
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Info Message */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          💡 We typically respond within 24 hours. For urgent issues, please include as much detail as possible.
        </p>
      </Card>
    </div>
  );
}; 