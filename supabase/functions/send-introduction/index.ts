import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntroductionRequest {
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  channel: 'email' | 'whatsapp';
  customMessage: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { buyerId, buyerName, buyerEmail, buyerPhone, channel, customMessage }: IntroductionRequest = await req.json();
    
    console.log(`Processing introduction request for buyer: ${buyerId}, channel: ${channel}`);

    // Get sender info from JWT
    const authHeader = req.headers.get('authorization');
    let senderInfo = { name: 'A Naybourhood Partner', email: '', company: 'Naybourhood' };
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, company_id')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          senderInfo = {
            name: profile.full_name || user.email?.split('@')[0] || 'A Partner',
            email: profile.email || user.email || '',
            company: 'Naybourhood Partner'
          };
          
          // Get company name if available
          if (profile.company_id) {
            const { data: company } = await supabase
              .from('companies')
              .select('name')
              .eq('id', profile.company_id)
              .single();
            if (company?.name) {
              senderInfo.company = company.name;
            }
          }
        }
      }
    }

    console.log(`Sender info:`, senderInfo);

    if (channel === 'email') {
      if (!buyerEmail) {
        return new Response(
          JSON.stringify({ error: 'Buyer email is required for email introductions' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      
      if (RESEND_API_KEY) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Introduction from ${senderInfo.name}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 16px; }
              .logo { font-size: 20px; font-weight: bold; color: #1a1a1a; letter-spacing: -0.5px; }
              .message { white-space: pre-wrap; color: #333; margin: 24px 0; padding: 16px; background: #f9f9f9; border-radius: 8px; }
              .contact-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; padding: 20px; margin-top: 24px; }
              .contact-card h3 { margin: 0 0 16px 0; font-size: 16px; opacity: 0.9; }
              .contact-item { display: flex; align-items: center; margin: 8px 0; }
              .contact-item strong { margin-right: 8px; }
              .footer { text-align: center; margin-top: 24px; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <div class="logo">NAYBOURHOOD</div>
                  <p style="color: #666; margin-top: 8px; font-size: 14px;">Property Introduction</p>
                </div>
                
                <p>Hi ${buyerName},</p>
                
                <div class="message">${customMessage}</div>
                
                <div class="contact-card">
                  <h3>Contact Details</h3>
                  <div class="contact-item">
                    <strong>Name:</strong> ${senderInfo.name}
                  </div>
                  <div class="contact-item">
                    <strong>Company:</strong> ${senderInfo.company}
                  </div>
                  ${senderInfo.email ? `
                  <div class="contact-item">
                    <strong>Email:</strong> <a href="mailto:${senderInfo.email}" style="color: white;">${senderInfo.email}</a>
                  </div>
                  ` : ''}
                </div>
                
                <div class="footer">
                  <p>This introduction was sent via Naybourhood.</p>
                  <p>If you didn't request this, please ignore this email.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send via Resend API using fetch
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Naybourhood <introductions@resend.dev>',
            to: [buyerEmail],
            subject: `${senderInfo.name} from ${senderInfo.company} would like to connect`,
            html: emailHtml,
            reply_to: senderInfo.email || undefined,
          }),
        });

        if (!resendResponse.ok) {
          const errorText = await resendResponse.text();
          console.error('Resend API error:', errorText);
          throw new Error(`Failed to send email: ${errorText}`);
        }

        const emailResult = await resendResponse.json();
        console.log("Email sent successfully:", emailResult);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Introduction email sent successfully',
            emailId: emailResult.id 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // No Resend API key configured - log and return success for demo
        console.log('RESEND_API_KEY not configured. Would send email to:', buyerEmail);
        console.log('Subject:', `${senderInfo.name} from ${senderInfo.company} would like to connect`);
        console.log('Message:', customMessage);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Introduction logged (email service not configured)',
            demo: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (channel === 'whatsapp') {
      // WhatsApp integration - log for now
      console.log('WhatsApp introduction requested');
      console.log('Buyer phone:', buyerPhone);
      console.log('Message:', customMessage);
      console.log('Sender:', senderInfo);
      
      // Future: Integrate with Twilio or Meta Business API
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'WhatsApp introduction logged (integration pending)',
          demo: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid channel specified' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("Error in send-introduction function:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send introduction' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
