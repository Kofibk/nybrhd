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
}

export const LeadSourceBadge = ({ source, sourceDetail }: LeadSourceBadgeProps) => {
  const sourceConfig: Record<string, { icon: string; label: string }> = {
    meta_campaign: { icon: "📱", label: "Meta" },
    portal: { icon: "🏠", label: "Portal" },
    direct_web: { icon: "🌐", label: "Website" },
    email_forward: { icon: "📧", label: "Email" },
    introducer: { icon: "🤝", label: "Introducer" },
    crm_import: { icon: "🔄", label: "CRM" },
    manual_upload: { icon: "📤", label: "Upload" },
  };

  const config = sourceConfig[source] || { icon: "📥", label: source };

  return (
    <Badge variant="secondary" className="text-xs font-normal">
      <span className="mr-1">{config.icon}</span>
      <span>{sourceDetail || config.label}</span>
    </Badge>
  );
};
