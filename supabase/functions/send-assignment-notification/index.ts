import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssignmentNotification {
  callerEmail: string;
  callerName: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerBudget?: string;
  buyerLocation?: string;
  buyerIntent?: string;
  buyerScore?: number;
  buyerTimeline?: string;
  buyerDevelopment?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification: AssignmentNotification = await req.json();
    
    const {
      callerEmail,
      callerName,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerBudget,
      buyerLocation,
      buyerIntent,
      buyerScore,
      buyerTimeline,
      buyerDevelopment,
    } = notification;

    if (!callerEmail) {
      return new Response(
        JSON.stringify({ error: 'Caller email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build email content
    const intentEmoji = buyerIntent?.toLowerCase() === 'hot' ? '🔥' : 
                        buyerIntent?.toLowerCase() === 'warm' ? '🌡️' : '❄️';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lead Assignment</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: bold; color: #333; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .badge-hot { background: #ef4444; color: white; }
          .badge-warm { background: #f59e0b; color: white; }
          .badge-cold { background: #3b82f6; color: white; }
          .score { font-size: 32px; font-weight: bold; color: ${(buyerScore || 0) >= 70 ? '#22c55e' : '#f59e0b'}; }
          .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .detail-label { color: #666; flex: 1; }
          .detail-value { color: #333; font-weight: 500; flex: 2; }
          .cta { text-align: center; margin-top: 24px; }
          .button { display: inline-block; padding: 12px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; margin-top: 24px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">NAYBOURHOOD</div>
              <p style="color: #666; margin-top: 8px;">New Lead Assignment</p>
            </div>
            
            <p>Hi ${callerName || 'there'},</p>
            <p>You've been assigned a new lead. Here are the details:</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <div class="score">${buyerScore || 'N/A'}</div>
              <div style="color: #666; font-size: 14px;">Quality Score</div>
              <div style="margin-top: 8px;">
                <span class="badge ${buyerIntent?.toLowerCase() === 'hot' ? 'badge-hot' : buyerIntent?.toLowerCase() === 'warm' ? 'badge-warm' : 'badge-cold'}">
                  ${intentEmoji} ${buyerIntent || 'Unknown'} Intent
                </span>
              </div>
            </div>
            
            <h3 style="margin-bottom: 12px; color: #333;">Lead Details</h3>
            
            <div class="detail-row">
              <span class="detail-label">Name</span>
              <span class="detail-value">${buyerName}</span>
            </div>
            ${buyerEmail ? `
            <div class="detail-row">
              <span class="detail-label">Email</span>
              <span class="detail-value"><a href="mailto:${buyerEmail}">${buyerEmail}</a></span>
            </div>
            ` : ''}
            ${buyerPhone ? `
            <div class="detail-row">
              <span class="detail-label">Phone</span>
              <span class="detail-value"><a href="tel:${buyerPhone}">${buyerPhone}</a></span>
            </div>
            ` : ''}
            ${buyerBudget ? `
            <div class="detail-row">
              <span class="detail-label">Budget</span>
              <span class="detail-value">${buyerBudget}</span>
            </div>
            ` : ''}
            ${buyerLocation ? `
            <div class="detail-row">
              <span class="detail-label">Location</span>
              <span class="detail-value">${buyerLocation}</span>
            </div>
            ` : ''}
            ${buyerTimeline ? `
            <div class="detail-row">
              <span class="detail-label">Timeline</span>
              <span class="detail-value">${buyerTimeline}</span>
            </div>
            ` : ''}
            ${buyerDevelopment ? `
            <div class="detail-row">
              <span class="detail-label">Development</span>
              <span class="detail-value">${buyerDevelopment}</span>
            </div>
            ` : ''}
            
            <div class="cta">
              <a href="${Deno.env.get('SITE_URL') || 'https://naybourhood.ai'}/admin/leads" class="button">
                View in Dashboard
              </a>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from Naybourhood.</p>
              <p>Please contact the lead within 24 hours for best results.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Use Supabase's built-in email (via Auth hooks) or log for now
    // In production, integrate with Resend, SendGrid, or another email service
    console.log('Assignment notification prepared for:', callerEmail);
    console.log('Buyer:', buyerName, 'Score:', buyerScore, 'Intent:', buyerIntent);
    
    // For now, we'll use Supabase's edge function email capability
    // You can replace this with Resend or another service
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (RESEND_API_KEY) {
      // Send via Resend if configured
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Naybourhood <notifications@naybourhood.ai>',
          to: [callerEmail],
          subject: `🔔 New Lead Assigned: ${buyerName} (Score: ${buyerScore || 'N/A'})`,
          html: emailHtml,
        }),
      });
      
      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        console.error('Resend error:', error);
        throw new Error('Failed to send email via Resend');
      }
      
      const result = await resendResponse.json();
      console.log('Email sent via Resend:', result);
      
      return new Response(
        JSON.stringify({ success: true, emailId: result.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Log the notification for debugging (no email service configured)
      console.log('No email service configured. Notification logged only.');
      console.log('Would send to:', callerEmail);
      console.log('Subject:', `New Lead Assigned: ${buyerName}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Notification logged (no email service configured)',
          notification: {
            to: callerEmail,
            buyer: buyerName,
            score: buyerScore,
            intent: buyerIntent,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    console.error('Error in send-assignment-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to send notification', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
