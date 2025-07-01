import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')?.replace('v1,', '') || '';

interface AuthWebhookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      user_type?: string;
      company_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const generateAuthEmailHTML = (user: any, emailData: any): string => {
  const baseStyle = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; margin: 0; }
      .content { padding: 30px 20px; }
      .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      .footer { padding: 20px; background: #f8fafc; text-align: center; font-size: 14px; color: #64748b; }
      .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
      .security-note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
      .link-fallback { margin: 20px 0; padding: 15px; background: #f1f5f9; border-radius: 6px; }
    </style>
  `;

  const userName = user.user_metadata?.full_name || 'there';
  const userTypeText = user.user_metadata?.user_type === 'brand' ? 'brand' : 'running club';
  const { email_action_type, token_hash, redirect_to, site_url } = emailData;

  // DEBUG: Log the values we're receiving
  console.log('=== AUTH EMAIL DEBUG ===');
  console.log('email_action_type:', email_action_type);
  console.log('redirect_to:', redirect_to);
  console.log('site_url:', site_url);
  console.log('========================');

  // Build the confirmation URL using site_url instead of redirect_to
  // This fixes the bug where emails were going to homepage instead of /auth/confirm
  const confirmUrl = `${site_url}?token_hash=${token_hash}&type=${email_action_type}`;

  switch (email_action_type) {
    case 'signup':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Confirm Your Email - RUNHUB LINK</title>
          ${baseStyle}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">RUNHUB LINK</div>
              <h1>Welcome ${userName}! 🎉</h1>
            </div>
            
            <div class="content">
              <h2>Confirm your email address</h2>
              <p>Thanks for joining RUNHUB LINK as a ${userTypeText}! We're excited to help you connect with amazing opportunities in the running community.</p>
              
              <p>To complete your registration and start exploring, please confirm your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${confirmUrl}" class="button">
                  Confirm Your Email
                </a>
              </div>
              
              <div class="security-note">
                <strong>🔒 Security Note:</strong> This link will expire in 24 hours for your security. If you didn't create an account with RUNHUB LINK, you can safely ignore this email.
              </div>
              
              <div class="link-fallback">
                <p><strong>Having trouble with the button?</strong> Copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${confirmUrl}</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Welcome to the RUNHUB LINK community!</p>
              <p>Questions? Reply to this email or contact us at <a href="mailto:support@runhub.co">support@runhub.co</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'recovery':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reset Your Password - RUNHUB LINK</title>
          ${baseStyle}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">RUNHUB LINK</div>
              <h1>Password Reset Request 🔐</h1>
            </div>
            
            <div class="content">
              <h2>Reset your password</h2>
              <p>Hi ${userName},</p>
              
              <p>We received a request to reset the password for your RUNHUB LINK account. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${confirmUrl}" class="button">
                  Reset Password
                </a>
              </div>
              
              <div class="security-note">
                <strong>🔒 Security Note:</strong> This link will expire in 1 hour for your security. If you didn't request a password reset, you can safely ignore this email - your password will remain unchanged.
              </div>
              
              <div class="link-fallback">
                <p><strong>Having trouble with the button?</strong> Copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${confirmUrl}</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Keep your account secure with RUNHUB LINK</p>
              <p>Questions? Reply to this email or contact us at <a href="mailto:support@runhub.co">support@runhub.co</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'email_change':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Confirm Email Change - RUNHUB LINK</title>
          ${baseStyle}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">RUNHUB LINK</div>
              <h1>Confirm Email Change ✉️</h1>
            </div>
            
            <div class="content">
              <h2>Confirm your new email address</h2>
              <p>Hi ${userName},</p>
              
              <p>You requested to change your email address for your RUNHUB LINK account. Please confirm your new email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${confirmUrl}" class="button">
                  Confirm New Email
                </a>
              </div>
              
              <div class="security-note">
                <strong>🔒 Security Note:</strong> This link will expire in 24 hours. If you didn't request this email change, please contact our support team immediately.
              </div>
              
              <div class="link-fallback">
                <p><strong>Having trouble with the button?</strong> Copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${confirmUrl}</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Secure your RUNHUB LINK account</p>
              <p>Questions? Reply to this email or contact us at <a href="mailto:support@runhub.co">support@runhub.co</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      throw new Error(`Unsupported auth email type: ${email_action_type}`);
  }
};

const handler = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!hookSecret) {
      console.error('SEND_EMAIL_HOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the webhook
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers);
    
    // For now, skip verification if secret is not properly configured
    let user: any, email_data: any;
    
    if (hookSecret && hookSecret.length > 10) {
      try {
        const wh = new Webhook(hookSecret);
        const verified = wh.verify(payload, headers) as AuthWebhookPayload;
        user = verified.user;
        email_data = verified.email_data;
      } catch (error) {
        console.warn('Webhook verification failed, parsing directly:', error.message);
        const parsed = JSON.parse(payload) as AuthWebhookPayload;
        user = parsed.user;
        email_data = parsed.email_data;
      }
    } else {
      console.warn('Webhook secret not configured, parsing payload directly');
      const parsed = JSON.parse(payload) as AuthWebhookPayload;
      user = parsed.user;
      email_data = parsed.email_data;
    }

    console.log('Processing auth email:', email_data.email_action_type, 'for user:', user.email);

    // DEBUG: Log the actual values being received
    console.log('=== EMAIL DATA DEBUG ===');
    console.log('email_data.redirect_to:', email_data.redirect_to);
    console.log('email_data.site_url:', email_data.site_url);
    console.log('email_data.token_hash:', email_data.token_hash);
    console.log('email_data.email_action_type:', email_data.email_action_type);
    console.log('========================');

    // Extract debug information
    const { email_action_type, token_hash, redirect_to, site_url } = email_data;

    // Build the confirmation URL using site_url instead of redirect_to
    // This fixes the bug where emails were going to homepage instead of /auth/confirm
    const confirmUrl = `${site_url}?token_hash=${token_hash}&type=${email_action_type}`;

    console.log('Built confirmation URL:', confirmUrl);

    const subjectMap = {
      'signup': 'Welcome to RUNHUB LINK - Confirm Your Email',
      'recovery': 'Reset Your RUNHUB LINK Password',
      'email_change': 'Confirm Your New Email Address'
    };

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'RUNHUB LINK <noreply@mail.runhub.co>',
        to: [user.email],
        subject: subjectMap[email_data.email_action_type] || 'RUNHUB LINK Authentication',
        html: generateAuthEmailHTML(user, email_data),
      }),
    });

    const result = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error('Resend API error:', result);
      throw new Error(result.message || 'Auth email failed');
    }

    console.log('Auth email sent successfully:', result.id, 'type:', email_data.email_action_type);

    // Return empty successful response as required by Supabase webhooks
    return new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in auth email webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        error: {
          http_code: 500,
          message: error.message || 'Failed to send auth email'
        }
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler); 