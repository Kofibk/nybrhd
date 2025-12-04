import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CityRecommendation {
  cityCode: string;
  cityName: string;
  countryCode: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

interface UseAICityRecommendationsProps {
  userType: string;
  product?: string;
  propertyDetails?: string;
  focusSegment?: string;
  developmentName?: string;
  targetCountries: string[];
}

export const useAICityRecommendations = () => {
  const [recommendations, setRecommendations] = useState<CityRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async ({
    userType,
    product,
    propertyDetails,
    focusSegment,
    developmentName,
    targetCountries,
  }: UseAICityRecommendationsProps) => {
    if (targetCountries.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-cities", {
        body: {
          userType,
          product,
          propertyDetails,
          focusSegment,
          developmentName,
          targetCountries,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      // Don't show error toast - gracefully degrade to showing no AI recommendations
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    fetchRecommendations,
  };
};
