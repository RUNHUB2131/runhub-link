import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || type !== 'signup') {
        setStatus('error');
        setError('Invalid confirmation link');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) throw error;

        setStatus('success');
        toast({
          title: "Email confirmed!",
          description: "Your email has been successfully verified.",
        });

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } catch (error: any) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setError(error.message || 'Failed to confirm email');
      }
    };

    confirmEmail();
  }, [searchParams, navigate, toast]);

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary-500" />
            <h1 className="text-2xl font-bold mb-2">Confirming your email...</h1>
            <p className="text-gray-500">Please wait while we verify your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2">Email confirmed!</h1>
            <p className="text-gray-500 mb-4">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <p className="text-sm text-gray-400">Redirecting you to login...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Confirmation failed</h1>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/auth/login')} className="w-full">
              Go to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation; 