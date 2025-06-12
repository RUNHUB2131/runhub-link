import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface ContactFormData {
  name: string;
  email: string;
  issueType: string;
  subject: string;
  message: string;
  userType?: string;
  userId?: string;
}

const generateContactEmailHTML = (data: ContactFormData): string => {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .header { color: #2563eb; margin-bottom: 20px; font-size: 24px; }
      .section { margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #2563eb; }
      .label { font-weight: bold; color: #374151; margin-bottom: 5px; }
      .value { color: #6b7280; }
      .message-content { background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px; border: 1px solid #e5e7eb; }
      .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    </style>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Contact Form Submission</title>
      ${baseStyle}
    </head>
    <body>
      <div class="container">
        <h1 class="header">📧 New Contact Form Submission</h1>
        
        <div class="section">
          <div class="label">From:</div>
          <div class="value">${data.name} (${data.email})</div>
        </div>

        <div class="section">
          <div class="label">Issue Type:</div>
          <div class="value">${data.issueType}</div>
        </div>

        <div class="section">
          <div class="label">Subject:</div>
          <div class="value">${data.subject}</div>
        </div>

        ${data.userType ? `
        <div class="section">
          <div class="label">User Type:</div>
          <div class="value">${data.userType}</div>
        </div>
        ` : ''}

        <div class="section">
          <div class="label">Message:</div>
          <div class="message-content">${data.message.replace(/\n/g, '<br>')}</div>
        </div>

        <div class="footer">
          <p>This message was sent via the RUNHUB LINK contact form.</p>
          ${data.userId ? `<p><strong>User ID:</strong> ${data.userId}</p>` : ''}
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getIssueTypeLabel = (issueType: string): string => {
  const issueTypeMap: Record<string, string> = {
    'technical': 'Technical Issue',
    'account': 'Account Problem',
    'billing': 'Billing Question',
    'partnership': 'Partnership Issue',
    'feature': 'Feature Request',
    'bug': 'Bug Report',
    'other': 'Other'
  };
  
  return issueTypeMap[issueType] || issueType;
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

    const contactData: ContactFormData = await request.json();
    
    console.log('Sending contact form email from:', contactData.email);

    // Format issue type for display
    const formattedIssueType = getIssueTypeLabel(contactData.issueType);
    const displayData = {
      ...contactData,
      issueType: formattedIssueType
    };

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'RUNHUB Contact Form <noreply@mail.runhub.co>',
        to: ['hello@runhub.co'],
        reply_to: contactData.email,
        subject: `Contact Form: ${contactData.subject}`,
        html: generateContactEmailHTML(displayData),
      }),
    });

    const result = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error('Resend API error:', result);
      throw new Error(result.message || 'Email failed');
    }

    console.log('Contact form email sent successfully:', result.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact form email sent successfully',
        emailId: result.id
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
    console.error('Error sending contact form email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send contact form email', 
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