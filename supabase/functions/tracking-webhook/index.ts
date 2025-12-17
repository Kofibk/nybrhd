import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

interface PixelEvent {
  event_type: 'page_view' | 'brochure_view' | 'time_on_site' | 'form_submit' | 'click';
  lead_id?: string;
  lead_email?: string;
  timestamp: string;
  properties?: Record<string, any>;
  source: 'website' | 'email' | 'meta_pixel' | 'google_analytics';
}

interface EmailEvent {
  event_type: 'email_open' | 'email_click' | 'email_bounce' | 'email_unsubscribe';
  lead_email: string;
  campaign_id?: string;
  timestamp: string;
  properties?: Record<string, any>;
  source: 'sendgrid' | 'mailchimp' | 'resend' | 'postmark';
}

interface WhatsAppEvent {
  event_type: 'message_sent' | 'message_delivered' | 'message_read' | 'button_click';
  lead_phone: string;
  lead_id?: string;
  timestamp: string;
  properties?: Record<string, any>;
}

// In-memory storage for demo (replace with database in production)
const eventStore: Map<string, any[]> = new Map();

function getStorageKey(identifier: string): string {
  return identifier.toLowerCase().trim();
}

function storeEvent(identifier: string, event: any) {
  const key = getStorageKey(identifier);
  const existing = eventStore.get(key) || [];
  existing.push({
    ...event,
    received_at: new Date().toISOString(),
  });
  eventStore.set(key, existing);
  console.log(`Stored event for ${key}:`, event.event_type);
}

function getEvents(identifier: string): any[] {
  const key = getStorageKey(identifier);
  return eventStore.get(key) || [];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    // GET endpoint to retrieve events for a lead
    if (req.method === 'GET') {
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

      const events = getEvents(identifier);
      
      // Calculate aggregated behavioural data
      const behaviouralData = {
        brochureViews: events.filter(e => e.event_type === 'brochure_view').length,
        emailOpens: events.filter(e => e.event_type === 'email_open').length,
        whatsappClicks: events.filter(e => 
          e.event_type === 'button_click' || 
          (e.event_type === 'click' && e.properties?.target === 'whatsapp')
        ).length,
        timeOnSite: events
          .filter(e => e.event_type === 'time_on_site')
          .reduce((sum, e) => sum + (e.properties?.duration || 0), 0),
        totalEvents: events.length,
        lastActivity: events.length > 0 ? events[events.length - 1].received_at : null,
      };

      return new Response(
        JSON.stringify({ events, behaviouralData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST endpoints for receiving events
    if (req.method === 'POST') {
      const body = await req.json();

      switch (path) {
        case 'pixel': {
          const event = body as PixelEvent;
          console.log('Received pixel event:', event);

          if (!event.event_type) {
            return new Response(
              JSON.stringify({ error: 'event_type is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const identifier = event.lead_email || event.lead_id;
          if (identifier) {
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
          console.log('Received email event:', event);

          if (!event.event_type || !event.lead_email) {
            return new Response(
              JSON.stringify({ error: 'event_type and lead_email are required' }),
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
          console.log('Received WhatsApp event:', event);

          if (!event.event_type || !event.lead_phone) {
            return new Response(
              JSON.stringify({ error: 'event_type and lead_phone are required' }),
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
          const events = body.events as any[];
          console.log('Received bulk events:', events.length);

          let processed = 0;
          for (const event of events) {
            const identifier = event.lead_email || event.lead_phone || event.lead_id;
            if (identifier) {
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
          const genericEvent = body;
          const identifier = genericEvent.lead_email || genericEvent.lead_phone || genericEvent.lead_id;
          
          if (identifier && genericEvent.event_type) {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
