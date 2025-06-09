// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RUNHUB_EMAIL = Deno.env.get('RUNHUB_EMAIL') || 'hello@runhub.co';

interface QuoteRequestData {
  opportunity: {
    id: string;
    title: string;
    activation_overview: string;
    target_launch_date: string;
    content_specifications: string;
    professional_media: string;
    media_requirements?: string;
    club_responsibilities: string;
    club_incentives: string;
    city: string;
    state: string;
    club_size_preference: string;
    online_reach_preference: string;
    additional_notes?: string;
  };
  brandDetails: {
    company_name: string;
    contact_email: string;
    contact_name?: string;
  };
}

const generateEmailHTML = (data: QuoteRequestData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
          <title>New Quote Request - RUNHUB LINK</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    .section { margin: 20px 0; }
    .section h3 { color: #007bff; margin-bottom: 10px; }
    .highlight { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <h1 class="header">🎯 New Quote Request</h1>
  
  <div class="highlight">
    <p><strong>Brand:</strong> ${data.brandDetails.company_name}</p>
    <p><strong>Contact Email:</strong> ${data.brandDetails.contact_email}</p>
    ${data.brandDetails.contact_name ? `<p><strong>Contact Name:</strong> ${data.brandDetails.contact_name}</p>` : ''}
  </div>
  
  <div class="section">
    <h2>Opportunity Overview</h2>
    <p><strong>Title:</strong> ${data.opportunity.title}</p>
    <p><strong>Target Launch Date:</strong> ${data.opportunity.target_launch_date}</p>
    <p><strong>Location:</strong> ${data.opportunity.city}, ${data.opportunity.state}</p>
    <p><strong>Description:</strong></p>
    <p>${data.opportunity.activation_overview}</p>
  </div>
  
  <div class="section">
    <h3>📋 Content Requirements</h3>
    <p>${data.opportunity.content_specifications}</p>
  </div>
  
  <div class="section">
    <h3>📸 Professional Media Requirements</h3>
    <p><strong>Type:</strong> ${data.opportunity.professional_media}</p>
    ${data.opportunity.media_requirements ? `<p><strong>Details:</strong> ${data.opportunity.media_requirements}</p>` : ''}
  </div>
  
  <div class="grid">
    <div class="section">
      <h3>🏃‍♂️ Club Responsibilities</h3>
      <p>${data.opportunity.club_responsibilities}</p>
    </div>
    <div class="section">
      <h3>🎁 Club Incentives</h3>
      <p>${data.opportunity.club_incentives}</p>
    </div>
  </div>
  
  <div class="section">
    <h3>🎯 Target Criteria</h3>
    <div class="grid">
      <p><strong>Club Size:</strong> ${data.opportunity.club_size_preference}</p>
      <p><strong>Online Reach:</strong> ${data.opportunity.online_reach_preference}</p>
    </div>
  </div>
  
  ${data.opportunity.additional_notes ? `
  <div class="section">
    <h3>📝 Additional Notes</h3>
    <div class="highlight">
      <p>${data.opportunity.additional_notes}</p>
    </div>
  </div>
  ` : ''}
  
  <hr>
  <div class="highlight">
    <p><strong>🔥 Action Required:</strong> Please provide 3 professional quotes for this opportunity based on the requirements above.</p>
    <p><strong>Opportunity ID:</strong> ${data.opportunity.id}</p>
    <p><strong>Requested at:</strong> ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
};

const handler = async (request: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const requestData: QuoteRequestData = await request.json();

    // Send email using verified domain mail.runhub.co
    console.log('Sending quote request email...');
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'RUNHUB LINK <noreply@mail.runhub.co>',
        to: [RUNHUB_EMAIL],
        subject: `Quote Request: ${requestData.opportunity.title}`,
        html: generateEmailHTML(requestData),
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult);
      throw new Error(`Email service error: ${emailResult.message || 'Unknown error'}`);
    }

    console.log('Quote request email sent successfully:', emailResult.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Quote request sent successfully',
        emailId: emailResult.id 
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );

  } catch (error) {
    console.error('Error sending quote request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send quote request',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
};

serve(handler);

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-quote-request' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
