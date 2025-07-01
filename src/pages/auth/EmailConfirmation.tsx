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
      console.log('Starting email confirmation process...');
      console.log('Full URL:', window.location.href);
      console.log('Search params:', Object.fromEntries(searchParams.entries()));
      
      // Get URL parameters
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      console.log('URL Parameters:', { tokenHash, type, accessToken, refreshToken });
      
      // If we have access and refresh tokens, set session directly
      if (accessToken && refreshToken) {
        console.log('Found tokens in URL, setting session...');
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          console.log('SetSession result:', { data, error });
          
          if (error) throw error;
          
          if (data.user) {
            console.log('Session set successfully, user confirmed');
            setStatus('success');
            toast({
              title: "Email confirmed!",
              description: "Your email has been successfully verified.",
            });
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
            return;
          }
        } catch (error: any) {
          console.error('Error setting session:', error);
        }
      }
      
      // Check if session is automatically detected
      const { data: session } = await supabase.auth.getSession();
      console.log('Current session after URL load:', session);
      
      if (session?.session?.user) {
        console.log('Session automatically detected, user confirmed');
        setStatus('success');
        toast({
          title: "Email confirmed!",
          description: "Your email has been successfully verified.",
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        return;
      }

      // If no session and no tokens, try manual verification with token_hash
      if (!tokenHash) {
        setStatus('error');
        setError('Invalid confirmation link. Missing token_hash parameter.');
        return;
      }

      if (!type || !['signup', 'recovery', 'email_change'].includes(type)) {
        setStatus('error');
        setError(`Invalid confirmation type: ${type}. Expected signup, recovery, or email_change.`);
        return;
      }

      try {
        console.log('Attempting manual verifyOtp...');
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'signup' | 'recovery' | 'email_change'
        });

        console.log('VerifyOtp result:', { data, error });

        if (error) throw error;

        if (data.user) {
          console.log('Manual verification successful');
          setStatus('success');
          toast({
            title: "Email confirmed!",
            description: "Your email has been successfully verified.",
          });

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          throw new Error('Verification completed but no user data received');
        }
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
              Your email has been successfully verified. You can now access your account.
            </p>
            <p className="text-sm text-gray-400">Redirecting you to your dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Confirmation failed</h1>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/auth/login')} className="w-full">
                Go to Login
              </Button>
              <Button 
                onClick={() => navigate('/auth/register')} 
                variant="outline" 
                className="w-full"
              >
                Register Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation; 