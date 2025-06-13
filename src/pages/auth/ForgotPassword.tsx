import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error sending reset email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto px-4 sm:px-0">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline" 
            className="w-full"
          >
            Try again
          </Button>
          
          <div className="text-center">
            <Link to="/auth/login" className="text-sm text-primary-500 hover:underline inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Forgot password?</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          No worries, we'll send you reset instructions.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-11" 
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <Link to="/auth/login" className="text-sm text-primary-500 hover:underline inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword; 