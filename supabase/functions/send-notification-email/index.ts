import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailData {
  type: 'new_application' | 'application_status' | 'new_message' | 'new_opportunity';
  to: string;
  recipientName: string;
  data: {
    senderName?: string;
    opportunityTitle?: string;
    applicationStatus?: string;
    messagePreview?: string;
    deadline?: string;
  };
}

const generateEmailHTML = (emailData: EmailData, unsubscribeToken?: string): string => {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
      .container { background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .header { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
      .highlight { background-color: #eff6ff; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px; margin: 15px 0; }
      .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
      .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
      .footer a { color: #2563eb; text-decoration: none; }
      .footer a:hover { text-decoration: underline; }
      .preferences-links { margin-top: 15px; }
      .preferences-links a { margin-right: 15px; }
    </style>
  `;

  const footerLinks = unsubscribeToken ? `
    <div class="preferences-links">
      <a href="https://runhub.co/email-preferences?token=${unsubscribeToken}">Update email preferences</a>
      <a href="https://runhub.co/email-preferences?token=${unsubscribeToken}&unsubscribe=all">Unsubscribe from all emails</a>
    </div>
  ` : `
    <p>Update your email preferences in your account settings at <a href="https://runhub.co">runhub.co</a></p>
  `;

  switch (emailData.type) {
    case 'new_application':
      return `
        <!DOCTYPE html><html><head><title>New Application</title>${baseStyle}</head>
        <body><div class="container">
          <h1 class="header">🎉 New Application Received!</h1>
          <p>Hi ${emailData.recipientName},</p>
          <p>Great news! You've received a new application.</p>
          <div class="highlight">
            <p><strong>Opportunity:</strong> ${emailData.data.opportunityTitle}</p>
            <p><strong>Run Club:</strong> ${emailData.data.senderName}</p>
          </div>
          <a href="https://runhub.co/applications" class="button">Review Application</a>
          <div class="footer">
            ${footerLinks}
          </div>
        </div></body></html>
      `;
    
    case 'application_status':
      const isAccepted = emailData.data.applicationStatus === 'accepted';
      return `
        <!DOCTYPE html><html><head><title>Application Update</title>${baseStyle}</head>
        <body><div class="container">
          <h1 class="header">${isAccepted ? '🎉' : '📋'} Application Update</h1>
          <p>Hi ${emailData.recipientName},</p>
          <p>Your application for "${emailData.data.opportunityTitle}" has been <strong>${emailData.data.applicationStatus}</strong>.</p>
          ${isAccepted ? '<p>Congratulations! The brand will be in touch soon.</p>' : '<p>Thank you for your interest. Keep looking for new opportunities!</p>'}
          <a href="https://runhub.co/applications" class="button">View My Applications</a>
          <div class="footer">
            ${footerLinks}
          </div>
        </div></body></html>
      `;
      
    case 'new_message':
      return `
        <!DOCTYPE html><html><head><title>New Message</title>${baseStyle}</head>
        <body><div class="container">
          <h1 class="header">💬 New Message</h1>
          <p>Hi ${emailData.recipientName},</p>
          <p>You have a new message from ${emailData.data.senderName}.</p>
          <div class="highlight">
            <p><em>"${emailData.data.messagePreview}"</em></p>
          </div>
          <a href="https://runhub.co/chat" class="button">View Message</a>
          <div class="footer">
            ${footerLinks}
          </div>
        </div></body></html>
      `;
      
    case 'new_opportunity':
      return `
        <!DOCTYPE html><html><head><title>New Opportunity</title>${baseStyle}</head>
        <body><div class="container">
          <h1 class="header">🆕 New Opportunity Available!</h1>
          <p>Hi ${emailData.recipientName},</p>
          <p>A new sponsorship opportunity has been posted that might interest you.</p>
          <div class="highlight">
            <p><strong>Opportunity:</strong> ${emailData.data.opportunityTitle}</p>
            ${emailData.data.deadline ? `<p><strong>Deadline:</strong> ${emailData.data.deadline}</p>` : ''}
          </div>
          <a href="https://runhub.co/opportunities" class="button">View Opportunity</a>
          <div class="footer">
            ${footerLinks}
          </div>
        </div></body></html>
      `;
      
    default:
      throw new Error(`Unsupported email type: ${emailData.type}`);
  }
};

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
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailData: EmailData = await request.json();
    
    console.log('Sending notification email:', emailData.type);

    // Generate unsubscribe token for the recipient
    let unsubscribeToken = '';
    
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        const tokenResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/generate_email_preference_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            user_email: emailData.to
          })
        });
        
        if (tokenResponse.ok) {
          const result = await tokenResponse.text();
          unsubscribeToken = result.replace(/"/g, ''); // Remove quotes if returned as string
          console.log('Generated unsubscribe token for:', emailData.to);
        } else {
          console.warn('Failed to generate token, response:', tokenResponse.status);
        }
      }
    } catch (error) {
      console.warn('Failed to generate unsubscribe token:', error);
    }
    
    const subjectMap = {
      'new_application': `New Application: ${emailData.data.opportunityTitle}`,
      'application_status': emailData.data.applicationStatus === 'accepted' 
        ? `Application Accepted: ${emailData.data.opportunityTitle}` 
        : `Application Update: ${emailData.data.opportunityTitle}`,
      'new_message': `New Message from ${emailData.data.senderName}`,
      'new_opportunity': `New Opportunity: ${emailData.data.opportunityTitle}`
    };

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'RUNHUB Connect <noreply@mail.runhub.co>',
        to: [emailData.to],
        subject: subjectMap[emailData.type],
        html: generateEmailHTML(emailData, unsubscribeToken),
      }),
    });

    const result = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error('Resend API error:', result);
      throw new Error(result.message || 'Email failed');
    }

    console.log('Notification email sent successfully:', result.id, 'with token:', unsubscribeToken ? 'yes' : 'no');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification email sent successfully',
        emailId: result.id,
        type: emailData.type,
        hasUnsubscribeToken: !!unsubscribeToken
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
    console.error('Error sending notification email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notification email', 
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