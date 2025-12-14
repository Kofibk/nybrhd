import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdCopyVariation {
  headline: string;
  primaryText: string;
  description: string;
  cta: "Learn More" | "Book Viewing" | "Get Quote" | "Contact Us";
  angle: "investment" | "lifestyle" | "family" | "luxury" | "value";
}

export interface AdCopyResult {
  variations: AdCopyVariation[];
  recommendations: string[];
}

export interface EmailSequenceItem {
  day: number;
  subject: string;
  preview: string;
  body: string;
  cta: string;
  ctaUrl: string;
}

export interface EmailSequenceResult {
  sequence: EmailSequenceItem[];
  tips: string[];
}

export interface WhatsAppTemplate {
  name: string;
  category: "welcome" | "follow_up" | "viewing_reminder" | "offer" | "closing";
  message: string;
  variables: string[];
}

export interface WhatsAppTemplatesResult {
  templates: WhatsAppTemplate[];
}

export const useAIContentGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAdCopy = async (context: {
    development?: string;
    propertyType?: string;
    targetAudience?: string;
    usp?: string[];
    priceRange?: string;
  }): Promise<AdCopyResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-content-generation", {
        body: { action: "ad_copy", context },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate ad copy");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmailSequence = async (context: {
    leadType?: string;
    development?: string;
    goal?: string;
  }): Promise<EmailSequenceResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-content-generation", {
        body: { action: "email_sequence", context },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email sequence");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateWhatsAppTemplates = async (context: {
    development?: string;
    scenarios?: string[];
  }): Promise<WhatsAppTemplatesResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-content-generation", {
        body: { action: "whatsapp_templates", context },
      });
      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate WhatsApp templates");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const chat = async (message: string, history?: Array<{ role: string; content: string }>): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-content-generation", {
        body: { action: "chat_response", context: { message, history } },
      });
      if (fnError) throw fnError;
      return data.response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get chat response");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateAdCopy,
    generateEmailSequence,
    generateWhatsAppTemplates,
    chat,
    isLoading,
    error,
  };
};
