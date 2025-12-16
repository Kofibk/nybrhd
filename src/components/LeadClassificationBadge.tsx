import { Badge } from "@/components/ui/badge";
import { LeadClassification, LEAD_CLASSIFICATIONS } from "@/lib/types";
import { classifyLead, getClassificationConfig } from "@/lib/leadClassification";
import { cn } from "@/lib/utils";

interface LeadClassificationBadgeProps {
  classification?: LeadClassification;
  intentScore?: number;
  qualityScore?: number;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
}

export const LeadClassificationBadge = ({
  classification,
  intentScore,
  qualityScore,
  showLabel = true,
  size = "default",
}: LeadClassificationBadgeProps) => {
  // Calculate classification if not provided
  const effectiveClassification = 
    classification || 
    (intentScore !== undefined && qualityScore !== undefined 
      ? classifyLead(intentScore, qualityScore) 
      : "cold");

  const config = getClassificationConfig(effectiveClassification);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    default: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border-0",
        config.bgColor,
        config.color,
        sizeClasses[size]
      )}
    >
      <span className="mr-1">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
};

interface LeadSourceBadgeProps {
  source: string;
  sourceDetail?: string;
  size?: "sm" | "default";
}

export const LeadSourceBadge = ({ source, sourceDetail, size = "default" }: LeadSourceBadgeProps) => {
  const sourceConfig: Record<string, { icon: string; label: string; color: string }> = {
    meta_campaign: { icon: "📱", label: "Meta", color: "bg-blue-500/10 text-blue-600" },
    google_ads: { icon: "🔍", label: "Google", color: "bg-green-500/10 text-green-600" },
    rightmove: { icon: "🏠", label: "Rightmove", color: "bg-purple-500/10 text-purple-600" },
    zoopla: { icon: "🏠", label: "Zoopla", color: "bg-orange-500/10 text-orange-600" },
    onthemarket: { icon: "🏠", label: "OTM", color: "bg-teal-500/10 text-teal-600" },
    agent_referral: { icon: "🏷", label: "Referral", color: "bg-amber-500/10 text-amber-600" },
    direct_web: { icon: "🌐", label: "Direct", color: "bg-slate-500/10 text-slate-600" },
    other: { icon: "➕", label: "Other", color: "bg-gray-500/10 text-gray-600" },
  };

  const config = sourceConfig[source] || { icon: "➕", label: source, color: "bg-gray-500/10 text-gray-600" };

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "font-normal border-0",
        config.color,
        size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs"
      )}
    >
      <span className="mr-1">{config.icon}</span>
      <span>{sourceDetail || config.label}</span>
    </Badge>
  );
};
