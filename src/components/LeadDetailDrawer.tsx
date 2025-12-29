import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
  Briefcase,
  User,
  DollarSign,
  Globe,
  Building,
  BookOpen,
  MailOpen,
  Timer,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Loader2,
  Zap,
  Activity,
  Linkedin,
  ExternalLink,
  UserCheck,
  MessageSquare,
  ClipboardList
} from "lucide-react";
import { Lead, LEAD_SOURCES } from "@/lib/types";
import { LeadClassificationBadge, LeadSourceBadge } from "@/components/LeadClassificationBadge";
import { classifyLead } from "@/lib/leadClassification";
import { format } from "date-fns";
import { formatBudget } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAutoLeadAnalysis } from "@/hooks/useAutoLeadAnalysis";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

interface VerificationStatus {
  mortgageAIP: boolean;
  hasLawyer: boolean;
  ukResident: boolean;
  kycAmlCompleted: boolean;
  proofOfFunds: boolean;
}

interface BehaviouralData {
  brochureViews: number;
  whatsappClicks: number;
  emailOpens: number;
  timeOnSite: number;
}

interface ScoreBreakdown {
  label: string;
  score: number;
  max: number;
}

const ScoreBar = ({ label, score, max }: ScoreBreakdown) => {
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

// Storage keys for persisting data
const getStorageKey = (leadId: string, type: string) => `lead_${leadId}_${type}`;

export const LeadDetailDrawer = ({ lead, open, onClose }: LeadDetailDrawerProps) => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [autoAnalysisTriggered, setAutoAnalysisTriggered] = useState(false);
  const [thresholdsMet, setThresholdsMet] = useState<string[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    mortgageAIP: false,
    hasLawyer: false,
    ukResident: false,
    kycAmlCompleted: false,
    proofOfFunds: false,
  });
  const [behaviouralData, setBehaviouralData] = useState<BehaviouralData>({
    brochureViews: 0,
    whatsappClicks: 0,
    emailOpens: 0,
    timeOnSite: 0,
  });

  const { 
    checkThresholds, 
    checkAndTriggerAnalysis, 
    loadExistingAnalysis,
    calculateEngagementScore,
    DEFAULT_THRESHOLDS,
    isAnalysing: isAutoAnalysing,
    lastAnalysis,
  } = useAutoLeadAnalysis();

  // Load persisted data when lead changes
  useEffect(() => {
    if (lead?.id) {
      // Load verification status
      const savedVerification = localStorage.getItem(getStorageKey(lead.id, 'verification'));
      if (savedVerification) {
        setVerificationStatus(JSON.parse(savedVerification));
      } else {
        // Set defaults based on lead data
        setVerificationStatus({
          mortgageAIP: lead.paymentMethod === "mortgage" ? Math.random() > 0.5 : false,
          hasLawyer: Math.random() > 0.6,
          ukResident: lead.country === "United Kingdom" || lead.countryCode === "GB",
          kycAmlCompleted: Math.random() > 0.7,
          proofOfFunds: lead.paymentMethod === "cash" ? Math.random() > 0.4 : false,
        });
      }

      // Load behavioural data
      const savedBehavioural = localStorage.getItem(getStorageKey(lead.id, 'behavioural'));
      if (savedBehavioural) {
        setBehaviouralData(JSON.parse(savedBehavioural));
      } else {
        // Set defaults with some randomization for demo
        setBehaviouralData({
          brochureViews: Math.floor(Math.random() * 12) + 1,
          whatsappClicks: Math.floor(Math.random() * 6),
          emailOpens: Math.floor(Math.random() * 10) + 1,
          timeOnSite: Math.floor(Math.random() * 20) + 3,
        });
      }

      // Load AI insights
      const savedInsights = localStorage.getItem(getStorageKey(lead.id, 'insights'));
      if (savedInsights) {
        setAiInsights(savedInsights);
      } else {
        setAiInsights(null);
      }

      // Load existing auto-analysis
      loadExistingAnalysis(lead.id);
    }
  }, [lead?.id, loadExistingAnalysis]);

  // Check thresholds when behavioural data changes
  useEffect(() => {
    if (lead && behaviouralData) {
      const { shouldTrigger, thresholdsMet: met } = checkThresholds(behaviouralData);
      setThresholdsMet(met);
      setAutoAnalysisTriggered(shouldTrigger);
    }
  }, [lead, behaviouralData, checkThresholds]);

  // Update AI insights when auto-analysis completes
  useEffect(() => {
    if (lastAnalysis?.insights) {
      setAiInsights(lastAnalysis.insights);
      if (lead?.id) {
        localStorage.setItem(getStorageKey(lead.id, 'insights'), lastAnalysis.insights);
      }
    }
  }, [lastAnalysis, lead?.id]);

  // Save verification status when it changes
  const updateVerification = useCallback((field: keyof VerificationStatus, value: boolean) => {
    if (!lead?.id) return;
    
    const newStatus = { ...verificationStatus, [field]: value };
    setVerificationStatus(newStatus);
    localStorage.setItem(getStorageKey(lead.id, 'verification'), JSON.stringify(newStatus));
    toast.success(`${field.replace(/([A-Z])/g, ' $1').trim()} updated`);
  }, [lead?.id, verificationStatus]);

  // Track behavioural event and check for auto-analysis trigger
  const trackEvent = useCallback(async (eventType: keyof BehaviouralData) => {
    if (!lead?.id) return;
    
    const newData = { ...behaviouralData, [eventType]: behaviouralData[eventType] + 1 };
    setBehaviouralData(newData);
    localStorage.setItem(getStorageKey(lead.id, 'behavioural'), JSON.stringify(newData));

    // Check if this event triggers auto-analysis
    const result = await checkAndTriggerAnalysis(lead, newData, eventType);
    if (result) {
      toast.success('Auto-analysis triggered by engagement threshold!', {
        description: `Thresholds met: ${result.thresholdsMet.join(', ')}`,
      });
    }
  }, [lead, behaviouralData, checkAndTriggerAnalysis]);

  // Fetch AI insights from Claude
  const fetchAIInsights = useCallback(async () => {
    if (!lead) return;
    
    setIsLoadingInsights(true);
    try {
      const leadData = {
        ...lead,
        ...verificationStatus,
        ...behaviouralData,
      };

      const { data, error } = await supabase.functions.invoke('analyze-lead', {
        body: { lead: leadData }
      });

      if (error) throw error;

      if (data?.insights) {
        setAiInsights(data.insights);
        localStorage.setItem(getStorageKey(lead.id, 'insights'), data.insights);
        toast.success('AI analysis generated');
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setIsLoadingInsights(false);
    }
  }, [lead, verificationStatus, behaviouralData]);

  if (!lead) return null;

  const classification = lead.classification || classifyLead(lead.intentScore, lead.qualityScore);
  const isHighPriority = classification === "hot" || classification === "lightning";

  // Calculate scores
  const confidenceScore = Math.round((lead.intentScore + lead.qualityScore) / 2);
  const qualityScore10 = (lead.qualityScore / 10).toFixed(1);
  const engagementScore = ((lead.intentScore * 0.6 + lead.qualityScore * 0.4) / 10).toFixed(1);

  // Mock engagement history
  const engagementHistory = [
    { action: "Interested in viewing schedule", timestamp: new Date().toISOString() },
    { action: "Sent brochure and floor plans", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { action: "Initial consultation call", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { action: "Form submitted", timestamp: lead.createdAt || new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
  ];

  // Score breakdowns
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

  const getBuyerTypeLabel = (status?: string) => {
    const labels: Record<string, string> = {
      browsing: "Browsing",
      actively_looking: "Actively Looking",
      first_home: "First Home Buyer",
      home_mover: "Home Mover",
      investor: "Investor",
      international: "International Buyer",
    };
    return status ? labels[status] || status : "Not specified";
  };

  const getPurposeLabel = (purpose?: string) => {
    const labels: Record<string, string> = {
      investment: "Investment",
      primary_residence: "Primary Residence",
      personal_use: "Personal Use",
      holiday_home: "Holiday Home",
      child_education: "Child's Education",
    };
    return purpose ? labels[purpose] || purpose : "Not specified";
  };

  const getPaymentLabel = (method?: string) => {
    switch (method) {
      case "cash": return "Cash";
      case "mortgage": return "Mortgage";
      default: return "Undecided";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return format(new Date(timestamp), "MMM d, yyyy");
  };

  const getScoreColor = (score: number, max: number = 100) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{lead.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <LeadClassificationBadge classification={classification} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <LeadSourceBadge source={lead.source} sourceDetail={lead.sourceDetail} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5">
          {/* Score Cards - Hero Section */}
          <div className="grid grid-cols-3 gap-3">
            {/* Confidence Score */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Confidence Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(confidenceScore)}`}>
                  {confidenceScore}%
                </p>
              </div>
            </Card>
            
            {/* Quality Score */}
            <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Quality Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(parseFloat(qualityScore10), 10)}`}>
                  {qualityScore10}/10
                </p>
              </div>
            </Card>
            
            {/* Engagement Score */}
            <Card className="bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border-cyan-500/20 p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                <p className={`text-2xl font-bold ${getScoreColor(parseFloat(engagementScore), 10)}`}>
                  {engagementScore}/10
                </p>
              </div>
            </Card>
          </div>

          {/* Personal Information */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Address</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {lead.country || "United Kingdom"}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="font-medium flex items-center gap-2 truncate">
                  <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                  <a href={`mailto:${lead.email}`} className="hover:text-primary truncate">{lead.email}</a>
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <a href={`tel:${lead.phone}`} className="hover:text-primary">{lead.phone || "Not provided"}</a>
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-xs">Budget</p>
                <p className="font-medium flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  {formatBudget(lead.budget)}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-xs">Cash or Mortgage?</p>
                <p className="font-medium">{getPaymentLabel(lead.paymentMethod)}</p>
              </div>
            </div>

            <Separator className="my-3" />
            
            {/* Editable Verification Checkboxes */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="mortgageAIP"
                  checked={verificationStatus.mortgageAIP} 
                  onCheckedChange={(checked) => updateVerification('mortgageAIP', checked as boolean)}
                />
                <label htmlFor="mortgageAIP" className="text-muted-foreground cursor-pointer">Mortgage AIP</label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="hasLawyer"
                  checked={verificationStatus.hasLawyer} 
                  onCheckedChange={(checked) => updateVerification('hasLawyer', checked as boolean)}
                />
                <label htmlFor="hasLawyer" className="text-muted-foreground cursor-pointer">Lawyer</label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="ukResident"
                  checked={verificationStatus.ukResident} 
                  onCheckedChange={(checked) => updateVerification('ukResident', checked as boolean)}
                />
                <label htmlFor="ukResident" className="text-muted-foreground cursor-pointer">UK Resident</label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="kycAmlCompleted"
                  checked={verificationStatus.kycAmlCompleted} 
                  onCheckedChange={(checked) => updateVerification('kycAmlCompleted', checked as boolean)}
                />
                <label htmlFor="kycAmlCompleted" className="text-muted-foreground cursor-pointer">KYC/AML Completed</label>
              </div>
              
              <div className="flex items-center gap-2 col-span-2">
                <Checkbox 
                  id="proofOfFunds"
                  checked={verificationStatus.proofOfFunds} 
                  onCheckedChange={(checked) => updateVerification('proofOfFunds', checked as boolean)}
                />
                <label htmlFor="proofOfFunds" className="text-muted-foreground cursor-pointer">Proof of Funds</label>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Property/Development</p>
                <p className="font-medium flex items-center gap-2">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  {lead.campaignName || "Not specified"}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-xs">Buyer Type</p>
                <p className="font-medium flex items-center gap-2">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  {getBuyerTypeLabel(lead.buyerStatus)}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-xs">Reason for Purchase</p>
                <p className="font-medium flex items-center gap-2">
                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                  {getPurposeLabel(lead.purpose)}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-xs">Timeline to Purchase</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {getTimelineLabel(lead.purchaseTimeline)}
                </p>
              </div>
              
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Source</p>
                <p className="font-medium flex items-center gap-2">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  {LEAD_SOURCES.find(s => s.value === lead.source)?.label || lead.source || "Direct"}
                  {lead.sourceDetail && ` - ${lead.sourceDetail}`}
                </p>
              </div>
            </div>
          </Card>

          {/* Extended Airtable Details */}
          {(lead.agentTranscription || lead.linkedinProfile || lead.buyerSummary || lead.assignedCaller || lead.preferredCommunication) && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Extended Details</h3>
              </div>
              
              <div className="space-y-4">
                {/* Quick Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {lead.purchaseIn28Days && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                      <Clock className="h-3 w-3 mr-1" />
                      Purchase in 28 Days
                    </Badge>
                  )}
                  {lead.brokerNeeded && (
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Broker Needed
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  {lead.assignedCaller && (
                    <div>
                      <p className="text-muted-foreground text-xs">Assigned Caller</p>
                      <p className="font-medium flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {lead.assignedCaller}
                      </p>
                    </div>
                  )}
                  
                  {lead.preferredCommunication && (
                    <div>
                      <p className="text-muted-foreground text-xs">Preferred Communication</p>
                      <p className="font-medium flex items-center gap-2">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        {lead.preferredCommunication}
                      </p>
                    </div>
                  )}
                  
                  {lead.location && (
                    <div>
                      <p className="text-muted-foreground text-xs">Preferred Location</p>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {lead.location}
                      </p>
                    </div>
                  )}
                  
                  {lead.campaignSource && (
                    <div>
                      <p className="text-muted-foreground text-xs">Campaign/Source</p>
                      <p className="font-medium flex items-center gap-2">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        {lead.campaignSource}
                      </p>
                    </div>
                  )}
                </div>

                {lead.linkedinProfile && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">LinkedIn Profile</p>
                    <a 
                      href={lead.linkedinProfile.startsWith('http') ? lead.linkedinProfile : `https://${lead.linkedinProfile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Linkedin className="h-4 w-4" />
                      View LinkedIn Profile
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {lead.buyerSummary && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Buyer Summary</p>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">{lead.buyerSummary}</p>
                  </div>
                )}

                {lead.agentTranscription && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Agent Transcription</p>
                    <div className="text-sm bg-muted/30 p-3 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {lead.agentTranscription}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Behavioural Analytics */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Behavioural Analytics</h3>
              </div>
              {autoAnalysisTriggered && (
                <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                  <Zap className="h-3 w-3" />
                  Auto-analysis enabled
                </Badge>
              )}
            </div>

            {/* Engagement Score Bar */}
            <div className="mb-4 p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Engagement Score</span>
                <span className="font-bold text-primary">{calculateEngagementScore(behaviouralData)}</span>
              </div>
              <Progress 
                value={(calculateEngagementScore(behaviouralData) / DEFAULT_THRESHOLDS.totalEngagementScore) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-analysis triggers at {DEFAULT_THRESHOLDS.totalEngagementScore} points
              </p>
            </div>

            {/* Thresholds Met */}
            {thresholdsMet.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1">
                {thresholdsMet.map((threshold, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                    <Check className="h-3 w-3 mr-1" />
                    {threshold}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  behaviouralData.brochureViews >= DEFAULT_THRESHOLDS.brochureViews 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-muted/30'
                }`}
                onClick={() => trackEvent('brochureViews')}
                title={`Click to track brochure view (threshold: ${DEFAULT_THRESHOLDS.brochureViews})`}
              >
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xl font-bold">{behaviouralData.brochureViews}</p>
                  <p className="text-xs text-muted-foreground">Brochure Views</p>
                </div>
              </div>
              
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  behaviouralData.whatsappClicks >= DEFAULT_THRESHOLDS.whatsappClicks 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-muted/30'
                }`}
                onClick={() => trackEvent('whatsappClicks')}
                title={`Click to track WhatsApp click (threshold: ${DEFAULT_THRESHOLDS.whatsappClicks})`}
              >
                <MessageCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-xl font-bold">{behaviouralData.whatsappClicks}</p>
                  <p className="text-xs text-muted-foreground">WhatsApp Clicks</p>
                </div>
              </div>
              
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  behaviouralData.emailOpens >= DEFAULT_THRESHOLDS.emailOpens 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-muted/30'
                }`}
                onClick={() => trackEvent('emailOpens')}
                title={`Click to track email open (threshold: ${DEFAULT_THRESHOLDS.emailOpens})`}
              >
                <MailOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xl font-bold">{behaviouralData.emailOpens}</p>
                  <p className="text-xs text-muted-foreground">Email Opens</p>
                </div>
              </div>
              
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  behaviouralData.timeOnSite >= DEFAULT_THRESHOLDS.timeOnSite 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-muted/30'
                }`}
                onClick={() => trackEvent('timeOnSite')}
                title={`Click to add time on site (threshold: ${DEFAULT_THRESHOLDS.timeOnSite} mins)`}
              >
                <Timer className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xl font-bold">{behaviouralData.timeOnSite}<span className="text-sm font-normal ml-1">mins</span></p>
                  <p className="text-xs text-muted-foreground">Time on Site</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Click to manually track events • Green = threshold met</p>
          </Card>

          {/* AI Insights & Notes */}
          <Card className="p-4 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">AI Insights & Notes</h3>
              </div>
              <div className="flex items-center gap-2">
                {lastAnalysis?.triggeredBy && (
                  <Badge variant="outline" className="text-xs bg-primary/10">
                    <Activity className="h-3 w-3 mr-1" />
                    Auto: {lastAnalysis.triggeredBy}
                  </Badge>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 gap-1.5"
                  onClick={fetchAIInsights}
                  disabled={isLoadingInsights || isAutoAnalysing}
                >
                  {isLoadingInsights || isAutoAnalysing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {isLoadingInsights || isAutoAnalysing ? 'Analysing...' : 'Analyse'}
                </Button>
              </div>
            </div>
            {lastAnalysis?.analyzedAt && (
              <p className="text-xs text-muted-foreground mb-2">
                Last analysed: {format(new Date(lastAnalysis.analyzedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isLoadingInsights || isAutoAnalysing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating AI analysis with Claude...
                </span>
              ) : (
                aiInsights || lead.notes || "Click 'Analyse' to generate AI insights, or interact with the lead to trigger auto-analysis."
              )}
            </p>
          </Card>

          {/* Engagement History */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Engagement History</h3>
            </div>
            <div className="space-y-4">
              {engagementHistory.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    {index < engagementHistory.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium">{event.action}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(event.timestamp)}</p>
                  </div>
                </div>
              ))}
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

          {/* Actions */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${lead.phone}`}>
                  <Phone className="h-4 w-4 mr-1" /> Call
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${lead.email}`}>
                  <Mail className="h-4 w-4 mr-1" /> Email
                </a>
              </Button>
              <Button size="sm" variant="default" asChild>
                <a href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                </a>
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
