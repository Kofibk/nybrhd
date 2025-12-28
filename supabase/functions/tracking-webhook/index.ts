import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

interface PixelEvent {
  event_type: 'page_view' | 'brochure_view' | 'time_on_site' | 'form_submit' | 'click';
  lead_id?: string;
  lead_email?: string;
  timestamp: string;
  properties?: Record<string, unknown>;
  source: 'website' | 'email' | 'meta_pixel' | 'google_analytics';
}

interface EmailEvent {
  event_type: 'email_open' | 'email_click' | 'email_bounce' | 'email_unsubscribe';
  lead_email: string;
  campaign_id?: string;
  timestamp: string;
  properties?: Record<string, unknown>;
  source: 'sendgrid' | 'mailchimp' | 'resend' | 'postmark';
}

interface WhatsAppEvent {
  event_type: 'message_sent' | 'message_delivered' | 'message_read' | 'button_click';
  lead_phone: string;
  lead_id?: string;
  timestamp: string;
  properties?: Record<string, unknown>;
}

// In-memory storage for demo (replace with database in production)
const eventStore: Map<string, unknown[]> = new Map();

function getStorageKey(identifier: string): string {
  return identifier.toLowerCase().trim();
}

function storeEvent(identifier: string, event: unknown) {
  const key = getStorageKey(identifier);
  const existing = eventStore.get(key) || [];
  existing.push({
    ...(event as Record<string, unknown>),
    received_at: new Date().toISOString(),
  });
  eventStore.set(key, existing);
  console.log(`Stored event for ${key}:`, (event as Record<string, unknown>).event_type);
}

function getEvents(identifier: string): unknown[] {
  const key = getStorageKey(identifier);
  return eventStore.get(key) || [];
}

// Verify webhook secret for POST requests
function verifyWebhookSecret(req: Request): boolean {
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
  // If no webhook secret is configured, allow requests (backward compatibility)
  if (!webhookSecret) {
    console.warn('WEBHOOK_SECRET not configured - webhook authentication disabled');
    return true;
  }
  
  const providedSecret = req.headers.get('x-webhook-secret');
  if (!providedSecret) {
    console.log('Missing x-webhook-secret header');
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (providedSecret.length !== webhookSecret.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < providedSecret.length; i++) {
    result |= providedSecret.charCodeAt(i) ^ webhookSecret.charCodeAt(i);
  }
  return result === 0;
}

// Verify Supabase auth for GET requests
async function verifyAuth(req: Request): Promise<{ authenticated: boolean; userId?: string }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { authenticated: false };
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return { authenticated: false };
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing');
      return { authenticated: false };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('Auth verification failed:', error?.message);
      return { authenticated: false };
    }
    
    return { authenticated: true, userId: user.id };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    // GET endpoint to retrieve events for a lead - requires authentication
    if (req.method === 'GET') {
      const { authenticated, userId } = await verifyAuth(req);
      if (!authenticated) {
        console.log('Unauthorized GET request attempted');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - valid authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Authenticated GET request from user: ${userId}`);

      const email = url.searchParams.get('email');
      const phone = url.searchParams.get('phone');
      const leadId = url.searchParams.get('lead_id');

      const identifier = email || phone || leadId;
      if (!identifier) {
        return new Response(
          JSON.stringify({ error: 'Provide email, phone, or lead_id parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Input validation
      if (identifier.length > 255) {
        return new Response(
          JSON.stringify({ error: 'Identifier too long' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const events = getEvents(identifier);
      
      // Calculate aggregated behavioural data
      const behaviouralData = {
        brochureViews: (events as Array<Record<string, unknown>>).filter(e => e.event_type === 'brochure_view').length,
        emailOpens: (events as Array<Record<string, unknown>>).filter(e => e.event_type === 'email_open').length,
        whatsappClicks: (events as Array<Record<string, unknown>>).filter(e => 
          e.event_type === 'button_click' || 
          (e.event_type === 'click' && (e.properties as Record<string, unknown>)?.target === 'whatsapp')
        ).length,
        timeOnSite: (events as Array<Record<string, unknown>>)
          .filter(e => e.event_type === 'time_on_site')
          .reduce((sum, e) => sum + ((e.properties as Record<string, unknown>)?.duration as number || 0), 0),
        totalEvents: events.length,
        lastActivity: events.length > 0 ? (events[events.length - 1] as Record<string, unknown>).received_at : null,
      };

      return new Response(
        JSON.stringify({ events, behaviouralData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST endpoints for receiving events - requires webhook secret
    if (req.method === 'POST') {
      if (!verifyWebhookSecret(req)) {
        console.log('Unauthorized POST request - invalid or missing webhook secret');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - valid webhook secret required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();

      // Basic input validation
      if (typeof body !== 'object' || body === null) {
        return new Response(
          JSON.stringify({ error: 'Invalid request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      switch (path) {
        case 'pixel': {
          const event = body as PixelEvent;
          console.log('Received pixel event:', event.event_type);

          if (!event.event_type) {
            return new Response(
              JSON.stringify({ error: 'event_type is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Validate event_type
          const validPixelEvents = ['page_view', 'brochure_view', 'time_on_site', 'form_submit', 'click'];
          if (!validPixelEvents.includes(event.event_type)) {
            return new Response(
              JSON.stringify({ error: 'Invalid event_type' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const identifier = event.lead_email || event.lead_id;
          if (identifier && identifier.length <= 255) {
            storeEvent(identifier, event);
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Pixel event received',
              event_id: crypto.randomUUID(),
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'email': {
          const event = body as EmailEvent;
          console.log('Received email event:', event.event_type);

          if (!event.event_type || !event.lead_email) {
            return new Response(
              JSON.stringify({ error: 'event_type and lead_email are required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Validate event_type
          const validEmailEvents = ['email_open', 'email_click', 'email_bounce', 'email_unsubscribe'];
          if (!validEmailEvents.includes(event.event_type)) {
            return new Response(
              JSON.stringify({ error: 'Invalid event_type' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Validate email format (basic check)
          if (event.lead_email.length > 255 || !event.lead_email.includes('@')) {
            return new Response(
              JSON.stringify({ error: 'Invalid lead_email' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          storeEvent(event.lead_email, event);

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Email event received',
              event_id: crypto.randomUUID(),
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'whatsapp': {
          const event = body as WhatsAppEvent;
          console.log('Received WhatsApp event:', event.event_type);

          if (!event.event_type || !event.lead_phone) {
            return new Response(
              JSON.stringify({ error: 'event_type and lead_phone are required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Validate event_type
          const validWhatsAppEvents = ['message_sent', 'message_delivered', 'message_read', 'button_click'];
          if (!validWhatsAppEvents.includes(event.event_type)) {
            return new Response(
              JSON.stringify({ error: 'Invalid event_type' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Validate phone (basic length check)
          if (event.lead_phone.length > 20 || event.lead_phone.length < 5) {
            return new Response(
              JSON.stringify({ error: 'Invalid lead_phone' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          storeEvent(event.lead_phone, event);

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'WhatsApp event received',
              event_id: crypto.randomUUID(),
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Bulk events endpoint
        case 'bulk': {
          const events = body.events as unknown[];
          
          if (!Array.isArray(events)) {
            return new Response(
              JSON.stringify({ error: 'events must be an array' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Limit bulk size to prevent resource exhaustion
          if (events.length > 1000) {
            return new Response(
              JSON.stringify({ error: 'Maximum 1000 events per bulk request' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('Received bulk events:', events.length);

          let processed = 0;
          for (const event of events) {
            const typedEvent = event as Record<string, unknown>;
            const identifier = (typedEvent.lead_email || typedEvent.lead_phone || typedEvent.lead_id) as string;
            if (identifier && typeof identifier === 'string' && identifier.length <= 255) {
              storeEvent(identifier, event);
              processed++;
            }
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: `Processed ${processed} events`,
              processed,
              total: events.length,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        default:
          // Generic event endpoint
          const genericEvent = body as Record<string, unknown>;
          const identifier = (genericEvent.lead_email || genericEvent.lead_phone || genericEvent.lead_id) as string;
          
          if (identifier && typeof identifier === 'string' && identifier.length <= 255 && genericEvent.event_type) {
            storeEvent(identifier, genericEvent);
            return new Response(
              JSON.stringify({ success: true, message: 'Event received' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ error: 'Invalid event format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in tracking-webhook function:', error);
    // Return generic error to avoid leaking internal details
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
