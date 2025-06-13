import { supabase } from "@/integrations/supabase/client";

interface AuthEmailData {
  type: 'signup_confirmation' | 'password_reset' | 'email_change_confirmation';
  to: string;
  token_hash: string;
  redirect_url: string;
  user_metadata?: {
    full_name?: string;
    user_type?: string;
  };
}

export const sendAuthEmail = async (emailData: AuthEmailData) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-auth-email', {
      body: emailData
    });

    if (error) {
      console.error('Error sending auth email:', error);
      throw error;
    }

    console.log('Auth email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send auth email:', error);
    throw error;
  }
};

export const sendSignupConfirmationEmail = async (
  email: string, 
  tokenHash: string, 
  userMetadata?: { full_name?: string; user_type?: string }
) => {
  const redirectUrl = `${window.location.origin}/auth/confirm`;
  
  return sendAuthEmail({
    type: 'signup_confirmation',
    to: email,
    token_hash: tokenHash,
    redirect_url: redirectUrl,
    user_metadata: userMetadata
  });
};

export const sendPasswordResetEmail = async (
  email: string, 
  tokenHash: string, 
  userMetadata?: { full_name?: string; user_type?: string }
) => {
  const redirectUrl = `${window.location.origin}/auth/reset-password`;
  
  return sendAuthEmail({
    type: 'password_reset',
    to: email,
    token_hash: tokenHash,
    redirect_url: redirectUrl,
    user_metadata: userMetadata
  });
}; 