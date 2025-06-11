import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

interface MagicLinkRequest {
  user_id: string;
  token: string;
}

const handler = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Methods': 'POST', 
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' 
      } 
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { user_id, token }: MagicLinkRequest = await request.json();
    
    console.log('Magic link signin request for user:', user_id);

    // Validate the magic link token first
    const { data: validationResult, error: validationError } = await supabaseAdmin
      .rpc('validate_magic_link_token', { token_value: token });

    if (validationError) {
      console.error('Token validation error:', validationError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate token' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!validationResult?.success) {
      console.error('Invalid token:', validationResult);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user_id matches
    if (validationResult.user_id !== user_id) {
      console.error('User ID mismatch');
      return new Response(
        JSON.stringify({ error: 'Token does not match user' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user details
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    
    if (userError || !userData.user) {
      console.error('User lookup error:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a session for the user using admin auth
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email!,
      options: {
        redirectTo: 'https://runhub.co/auth/callback'
      }
    });

    if (sessionError || !sessionData) {
      console.error('Session creation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For magic link authentication, we need to create a proper session
    // We'll return the verification info and let the client handle the auth
    console.log('Magic link signin successful for user:', user_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: userData.user.id,
          email: userData.user.email,
          user_metadata: userData.user.user_metadata
        },
        destination_path: validationResult.destination_path,
        verification_url: sessionData.properties?.action_link
      }), 
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        } 
      }
    );

  } catch (error) {
    console.error('Magic link signin error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Authentication failed', 
        message: error.message 
      }), 
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        } 
      }
    );
  }
};

serve(handler); 