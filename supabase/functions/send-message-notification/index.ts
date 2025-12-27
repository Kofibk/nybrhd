import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  conversationId: string;
  buyerId: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, buyerId, message }: NotificationRequest = await req.json();

    console.log(`Sending notification for conversation ${conversationId} to buyer ${buyerId}`);
    console.log(`Message preview: ${message.substring(0, 100)}...`);

    // TODO: Integrate with actual email/WhatsApp providers
    // For now, log the notification attempt
    
    // Email notification would go here (e.g., Resend, SendGrid)
    // WhatsApp notification would go here (e.g., Twilio, Meta Business API)

    return new Response(
      JSON.stringify({ success: true, message: "Notification queued" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
