import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";

const MagicLinkAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'redirect'>('loading');
  const [destination, setDestination] = useState('/dashboard');
  const [error, setError] = useState<string>('');

  const token = searchParams.get('token');

  useEffect(() => {
    // If user is already authenticated, redirect to destination or dashboard
    if (user && !isLoading) {
      const redirectPath = searchParams.get('redirect') || destination;
      navigate(redirectPath);
      return;
    }

    if (!token) {
      setStatus('error');
      setError('No authentication token provided');
      setIsLoading(false);
      return;
    }

    validateMagicLink();
  }, [token, user]);

  const validateMagicLink = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      
      // Call the validation function directly
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_magic_link_token', { token_value: token });

      if (validationError) {
        console.error('Magic link validation error:', validationError);
        setStatus('error');
        setError('Failed to validate authentication link');
        return;
      }

      // Parse the JSON result
      const result = typeof validationResult === 'string' 
        ? JSON.parse(validationResult) 
        : validationResult;

      if (!result?.success) {
        setStatus('expired');
        setError(result?.error || 'Authentication link is invalid or expired');
        return;
      }

      // Extract user info and destination from validation result
      const { user_id, email, destination_path } = result;
      setDestination(destination_path || '/dashboard');

      // Show success and redirect to login with email prefilled
      // This is the most secure approach - the user still needs to enter their password
      // but the email is verified through the magic link
      
      setStatus('redirect');
      
      toast({
        title: "Email verified successfully",
        description: "Redirecting you to complete sign in...",
      });

      // Redirect to login with email pre-filled and destination set
      setTimeout(() => {
        const loginUrl = `/auth/login?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(destination_path || '/dashboard')}&verified=true`;
        navigate(loginUrl);
      }, 1500);

    } catch (error) {
      console.error('Magic link authentication error:', error);
      setStatus('error');
      setError('An unexpected error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />;
      case 'success':
      case 'redirect':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'expired':
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return {
          title: 'Validating Link...',
          description: 'Please wait while we verify your authentication link.'
        };
      case 'redirect':
        return {
          title: 'Email Verified!',
          description: 'Your email has been verified. Redirecting you to complete sign in...'
        };
      case 'success':
        return {
          title: 'Authentication Successful!',
          description: 'You have been logged in securely. Redirecting you now...'
        };
      case 'expired':
        return {
          title: 'Link Expired',
          description: 'This authentication link has expired or has already been used.'
        };
      case 'error':
        return {
          title: 'Authentication Failed',
          description: error || 'We encountered an error while trying to verify your link.'
        };
      default:
        return { title: '', description: '' };
    }
  };

  const message = getStatusMessage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="mb-6 flex justify-center">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-bold mb-3 text-gray-900">
            {message.title}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message.description}
          </p>

          {(status === 'success' || status === 'redirect') && (
            <div className="flex items-center justify-center text-sm text-blue-600 mb-4">
              <span className="mr-2">Redirecting to sign in</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}

          {(status === 'error' || status === 'expired') && (
            <div className="space-y-3">
              <Link to="/auth/login">
                <Button className="w-full">
                  Sign In Manually
                </Button>
              </Link>
              
              <p className="text-sm text-gray-500">
                You can try{" "}
                <Link to="/auth/login" className="text-blue-600 hover:underline">
                  logging in with your email and password
                </Link>
              </p>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-sm text-gray-500">
              This may take a few moments...
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            Return to home page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkAuth; 