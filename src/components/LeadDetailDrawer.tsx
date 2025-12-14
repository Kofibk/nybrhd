import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Calendar, 
  FileText, 
  PenLine, 
  Edit,
  Check,
  Clock,
  Target,
  AlertCircle,
  Home,
  Briefcase
} from "lucide-react";
import { Lead, LEAD_SOURCES } from "@/lib/types";
import { LeadClassificationBadge, LeadSourceBadge } from "@/components/LeadClassificationBadge";
import { classifyLead } from "@/lib/leadClassification";
import { format } from "date-fns";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

interface ScoreBreakdown {
  label: string;
  score: number;
  max: number;
}

const ScoreBar = ({ label, score, max }: ScoreBreakdown) => {
  const percentage = (score / max) * 100;
  const filledDots = Math.round((score / max) * 5);
  
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground w-28">{label}:</span>
      <span className="font-medium w-12">{score}/{max}</span>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${i < filledDots ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const LeadDetailDrawer = ({ lead, open, onClose }: LeadDetailDrawerProps) => {
  if (!lead) return null;

  const classification = lead.classification || classifyLead(lead.intentScore, lead.qualityScore);
  const isHighPriority = classification === "hot" || classification === "lightning";

  // Mock engagement history
  const engagementHistory = [
    { action: "Form submitted", date: "Dec 7, 2:32 PM", completed: true },
    { action: "Brochure downloaded", date: "Dec 7, 2:35 PM", completed: true },
    { action: "WhatsApp reply", date: "Dec 7, 8:24 PM", completed: true, note: "6hr response" },
    { action: "Pricing link clicked", date: "Dec 8, 10:15 AM", completed: true },
    { action: "Viewing scheduled", date: "Dec 8, 11:30 AM", completed: lead.status === "booked_viewing" },
  ];

  // Mock score breakdowns
  const qualityBreakdown: ScoreBreakdown[] = [
    { label: "Financial", score: Math.round(lead.qualityScore * 0.35), max: 35 },
    { label: "Property Match", score: Math.round(lead.qualityScore * 0.25 * 0.8), max: 25 },
    { label: "Credentials", score: Math.round(lead.qualityScore * 0.25 * 0.6), max: 25 },
    { label: "Operational", score: Math.round(lead.qualityScore * 0.15), max: 15 },
  ];

  const intentBreakdown: ScoreBreakdown[] = [
    { label: "Timeline", score: Math.round(lead.intentScore * 0.4 * 0.625), max: 40 },
    { label: "Form Completion", score: Math.round(lead.intentScore * 0.2), max: 20 },
    { label: "Engagement", score: Math.round(lead.intentScore * 0.4 * 0.75), max: 40 },
  ];

  const getTimelineLabel = (timeline?: string) => {
    const labels: Record<string, string> = {
      within_28_days: "Within 28 days",
      "0_3_months": "0-3 months",
      "3_6_months": "3-6 months",
      "6_9_months": "6-9 months",
      "9_12_months": "9-12 months",
      "12_months_plus": "12+ months",
    };
    return timeline ? labels[timeline] || timeline : "Not specified";
  };

  const getBuyerStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      browsing: "Browsing",
      actively_looking: "Actively Looking",
    };
    return status ? labels[status] || status : "Not specified";
  };

  const getPurposeLabel = (purpose?: string) => {
    const labels: Record<string, string> = {
      investment: "Investment",
      primary_residence: "Primary Residence",
      holiday_home: "Holiday Home",
    };
    return purpose ? labels[purpose] || purpose : "Not specified";
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{lead.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <LeadClassificationBadge classification={classification} />
                <span className="text-sm text-muted-foreground">
                  Quality: {lead.qualityScore} • Intent: {lead.intentScore}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <LeadSourceBadge source={lead.source} sourceDetail={lead.sourceDetail} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5">
          {/* Contact Info */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${lead.email}`} className="hover:text-primary">{lead.email}</a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${lead.phone}`} className="hover:text-primary">{lead.phone}</a>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{lead.country || "United Kingdom"}</span>
              </div>
            </div>
          </Card>

          {/* Buyer Details */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Buyer Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Budget:</span>
                <p className="font-medium">{lead.budget || "Not specified"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Timeline:</span>
                <p className="font-medium">{getTimelineLabel(lead.purchaseTimeline)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Bedrooms:</span>
                <p className="font-medium">{lead.bedrooms || "Not specified"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment:</span>
                <p className="font-medium capitalize">{lead.paymentMethod || "Not specified"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium">{getBuyerStatusLabel(lead.buyerStatus)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Purpose:</span>
                <p className="font-medium flex items-center gap-1">
                  {lead.purpose === "investment" && <Briefcase className="h-3 w-3" />}
                  {lead.purpose === "primary_residence" && <Home className="h-3 w-3" />}
                  {getPurposeLabel(lead.purpose)}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Viewing:</span>
                <p className="font-medium">
                  {lead.viewingScheduled ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Scheduled ({format(new Date(lead.viewingScheduled), "MMM d, h:mma")})
                    </span>
                  ) : lead.status === "booked_viewing" ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Scheduled
                    </span>
                  ) : (
                    "Not scheduled"
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Scoring Breakdown */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Scoring Breakdown</h3>
            
            <div className="space-y-4">
              {/* Quality Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Quality Score</span>
                  <span className="text-lg font-bold text-primary">{lead.qualityScore}/100</span>
                </div>
                <Progress value={lead.qualityScore} className="h-2 mb-3" />
                <div className="space-y-1.5 pl-2">
                  {qualityBreakdown.map((item) => (
                    <ScoreBar key={item.label} {...item} />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Intent Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Intent Score</span>
                  <span className="text-lg font-bold text-primary">{lead.intentScore}/100</span>
                </div>
                <Progress value={lead.intentScore} className="h-2 mb-3" />
                <div className="space-y-1.5 pl-2">
                  {intentBreakdown.map((item) => (
                    <ScoreBar key={item.label} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Engagement History */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Engagement History</h3>
            <div className="space-y-2">
              {engagementHistory.map((event, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className={`mt-0.5 ${event.completed ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {event.completed ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <span className={event.completed ? '' : 'text-muted-foreground'}>{event.action}</span>
                    {event.note && (
                      <span className="text-muted-foreground ml-1">- {event.note}</span>
                    )}
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4 mr-1" /> Call
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4 mr-1" /> Email
              </Button>
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-1" /> Schedule Viewing
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-1" /> Send Brochure
              </Button>
              <Button size="sm" variant="outline">
                <PenLine className="h-4 w-4 mr-1" /> Add Note
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-1" /> Edit Details
              </Button>
            </div>
          </Card>

          {/* Recommended Next Steps */}
          {isHighPriority && (
            <Card className="p-4 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Recommended Next Steps</h3>
              </div>
              <div className="flex items-center gap-2 mb-3 text-sm">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="font-medium text-red-400">HIGH PRIORITY - Contact within 1 hour</span>
              </div>
              <ul className="space-y-1.5 text-sm pl-6">
                <li className="list-disc">Confirm viewing details</li>
                <li className="list-disc">Send property comparison</li>
                <li className="list-disc">Discuss financing options</li>
              </ul>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailDrawer;
