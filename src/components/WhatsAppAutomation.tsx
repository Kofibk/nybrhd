import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  MessageCircle, 
  Clock, 
  Zap, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Play, 
  Pause,
  Send,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MessageTemplate {
  id: string;
  name: string;
  category: "welcome" | "follow-up" | "reminder" | "nurture" | "booking";
  triggerStatus: string;
  triggerTimeline?: string;
  delayMinutes: number;
  message: string;
  isActive: boolean;
  sentCount: number;
  responseRate: number;
}

interface AutomationSequence {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggers: string[];
  steps: {
    id: string;
    templateId: string;
    delayHours: number;
    condition?: string;
  }[];
  stats: {
    enrolled: number;
    completed: number;
    conversions: number;
  };
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: "1",
    name: "New Lead Welcome",
    category: "welcome",
    triggerStatus: "New",
    delayMinutes: 0,
    message: "Hi {{name}}! 👋 Thank you for your interest in {{development}}. I'm here to help you find your perfect property.\n\nWould you like to:\n1️⃣ See available units\n2️⃣ Schedule a viewing\n3️⃣ Learn about pricing & payment plans\n\nJust reply with 1, 2, or 3!",
    isActive: true,
    sentCount: 245,
    responseRate: 78
  },
  {
    id: "2",
    name: "Hot Lead Follow-up",
    category: "follow-up",
    triggerStatus: "Engaged",
    triggerTimeline: "Within 28 days",
    delayMinutes: 30,
    message: "Hi {{name}}! 🏡\n\nI noticed you're looking to buy within the next 28 days - that's exciting!\n\nWe have {{available_units}} units available at {{development}} that match your criteria. Prices start from £{{starting_price}}.\n\nShall I book you a priority viewing this week?",
    isActive: true,
    sentCount: 89,
    responseRate: 65
  },
  {
    id: "3",
    name: "Viewing Reminder - 24h",
    category: "reminder",
    triggerStatus: "Viewing Booked",
    delayMinutes: -1440,
    message: "Hi {{name}}! 📅\n\nJust a friendly reminder about your viewing tomorrow:\n\n🏢 {{development}}\n📍 {{location}}\n🕐 {{viewing_time}}\n\nOur agent {{agent_name}} will be there to greet you.\n\nReply YES to confirm or let me know if you need to reschedule!",
    isActive: true,
    sentCount: 156,
    responseRate: 92
  },
  {
    id: "4",
    name: "Post-Viewing Follow-up",
    category: "follow-up",
    triggerStatus: "Viewed",
    delayMinutes: 120,
    message: "Hi {{name}}! 🌟\n\nThank you for visiting {{development}} today! What did you think?\n\nI'd love to hear your feedback:\n• Was the property what you expected?\n• Any questions about the units you saw?\n• Ready to discuss next steps?\n\nI'm here to help you make the right decision! 🏡",
    isActive: true,
    sentCount: 78,
    responseRate: 71
  },
  {
    id: "5",
    name: "Nurture - 3 Month Timeline",
    category: "nurture",
    triggerStatus: "Engaged",
    triggerTimeline: "3-6 months",
    delayMinutes: 10080,
    message: "Hi {{name}}! 👋\n\nIt's been a week since we last chatted. I wanted to share some exciting updates:\n\n✨ New units just released at {{development}}\n📉 Special early-bird pricing available\n🏗️ Construction is progressing ahead of schedule!\n\nWould you like me to send you the latest availability?",
    isActive: true,
    sentCount: 134,
    responseRate: 45
  },
  {
    id: "6",
    name: "Budget-Based Recommendation",
    category: "nurture",
    triggerStatus: "Engaged",
    delayMinutes: 60,
    message: "Hi {{name}}! 💰\n\nBased on your budget of {{budget_range}}, I've found {{matched_count}} properties that could be perfect for you:\n\n🏠 {{recommendation_1}}\n🏠 {{recommendation_2}}\n\nAll within your price range with great payment plans available.\n\nWhich one would you like to know more about?",
    isActive: false,
    sentCount: 67,
    responseRate: 58
  }
];

const defaultSequences: AutomationSequence[] = [
  {
    id: "1",
    name: "New Lead Nurture Flow",
    description: "Automated sequence for new leads from campaign",
    isActive: true,
    triggers: ["New lead from Meta", "New lead from website"],
    steps: [
      { id: "s1", templateId: "1", delayHours: 0 },
      { id: "s2", templateId: "2", delayHours: 24, condition: "No response" },
      { id: "s3", templateId: "5", delayHours: 168, condition: "Still engaged" }
    ],
    stats: { enrolled: 234, completed: 156, conversions: 45 }
  },
  {
    id: "2",
    name: "Viewing Booking Flow",
    description: "Reminder sequence for booked viewings",
    isActive: true,
    triggers: ["Viewing booked"],
    steps: [
      { id: "s1", templateId: "3", delayHours: -24 },
      { id: "s2", templateId: "4", delayHours: 2, condition: "After viewing" }
    ],
    stats: { enrolled: 89, completed: 82, conversions: 28 }
  }
];

const WhatsAppAutomation = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates);
  const [sequences, setSequences] = useState<AutomationSequence[]>(defaultSequences);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const stats = [
    { label: "Messages Sent Today", value: "156", icon: Send, color: "text-blue-500" },
    { label: "Response Rate", value: "68%", icon: TrendingUp, color: "text-green-500" },
    { label: "Active Sequences", value: "2", icon: Zap, color: "text-purple-500" },
    { label: "Leads in Flow", value: "89", icon: Users, color: "text-orange-500" },
  ];

  const toggleTemplate = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
    toast({
      title: "Template Updated",
      description: "Automation status changed successfully",
    });
  };

  const toggleSequence = (id: string) => {
    setSequences(sequences.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
    toast({
      title: "Sequence Updated",
      description: "Automation sequence status changed",
    });
  };

  const handleSaveTemplate = (template: MessageTemplate) => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates([...templates, { ...template, id: Date.now().toString() }]);
    }
    setIsDialogOpen(false);
    setEditingTemplate(null);
    toast({
      title: "Template Saved",
      description: "Your message template has been saved",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      welcome: "bg-green-500/10 text-green-600 border-green-500/20",
      "follow-up": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      reminder: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      nurture: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      booking: "bg-pink-500/10 text-pink-600 border-pink-500/20"
    };
    return colors[category] || "bg-muted";
  };

  const formatDelay = (minutes: number) => {
    if (minutes === 0) return "Instant";
    if (minutes < 0) return `${Math.abs(minutes / 60)}h before`;
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${minutes / 60}h after`;
    return `${Math.floor(minutes / 1440)} day(s) after`;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`${stat.color}`}>
                <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="sequences">Automation Sequences</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-semibold text-lg">Message Templates</h3>
              <p className="text-sm text-muted-foreground">Create templates triggered by lead status & timeline</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingTemplate(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
                </DialogHeader>
                <TemplateForm 
                  template={editingTemplate}
                  onSave={handleSaveTemplate}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline" className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      {template.isActive ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Pause className="h-3 w-3 mr-1" />
                          Paused
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Trigger: {template.triggerStatus}
                        {template.triggerTimeline && ` (${template.triggerTimeline})`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDelay(template.delayMinutes)}
                      </span>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {template.message}
                    </div>

                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Sent: <span className="font-medium text-foreground">{template.sentCount}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Response Rate: <span className="font-medium text-green-600">{template.responseRate}%</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={template.isActive}
                      onCheckedChange={() => toggleTemplate(template.id)}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => {
                        setEditingTemplate(template);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sequences Tab */}
        <TabsContent value="sequences" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-semibold text-lg">Automation Sequences</h3>
              <p className="text-sm text-muted-foreground">Multi-step automated message flows</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Sequence
            </Button>
          </div>

          <div className="grid gap-4">
            {sequences.map((sequence) => (
              <Card key={sequence.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium">{sequence.name}</h4>
                      {sequence.isActive ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                          <Play className="h-3 w-3 mr-1" />
                          Running
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Pause className="h-3 w-3 mr-1" />
                          Paused
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{sequence.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {sequence.triggers.map((trigger, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {trigger}
                        </Badge>
                      ))}
                    </div>

                    {/* Sequence Steps Visual */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {sequence.steps.map((step, idx) => {
                        const template = templates.find(t => t.id === step.templateId);
                        return (
                          <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center min-w-[100px]">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                {idx + 1}
                              </div>
                              <span className="text-xs text-muted-foreground mt-1 text-center">
                                {template?.name.substring(0, 15)}...
                              </span>
                              <span className="text-xs text-primary">
                                {step.delayHours === 0 ? "Instant" : 
                                 step.delayHours < 0 ? `${Math.abs(step.delayHours)}h before` :
                                 `+${step.delayHours}h`}
                              </span>
                            </div>
                            {idx < sequence.steps.length - 1 && (
                              <div className="w-8 h-px bg-border mx-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                      <div>
                        <div className="text-lg font-semibold">{sequence.stats.enrolled}</div>
                        <div className="text-xs text-muted-foreground">Enrolled</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{sequence.stats.completed}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{sequence.stats.conversions}</div>
                        <div className="text-xs text-muted-foreground">Conversions</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={sequence.isActive}
                      onCheckedChange={() => toggleSequence(sequence.id)}
                    />
                    <Button size="icon" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Template Variables</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use these variables in your templates to personalize messages:
            </p>
            <div className="flex flex-wrap gap-2">
              {["{{name}}", "{{development}}", "{{budget_range}}", "{{viewing_time}}", "{{agent_name}}", "{{starting_price}}", "{{available_units}}"].map((variable) => (
                <Badge key={variable} variant="secondary" className="font-mono text-xs">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Template Form Component
const TemplateForm = ({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template: MessageTemplate | null;
  onSave: (template: MessageTemplate) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<MessageTemplate>>(
    template || {
      name: "",
      category: "welcome",
      triggerStatus: "New",
      triggerTimeline: undefined,
      delayMinutes: 0,
      message: "",
      isActive: true,
      sentCount: 0,
      responseRate: 0
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as MessageTemplate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Template Name</Label>
        <Input 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Welcome Message"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select 
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as MessageTemplate["category"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="nurture">Nurture</SelectItem>
              <SelectItem value="booking">Booking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Trigger Status</Label>
          <Select 
            value={formData.triggerStatus}
            onValueChange={(value) => setFormData({ ...formData, triggerStatus: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New Lead</SelectItem>
              <SelectItem value="Engaged">Engaged</SelectItem>
              <SelectItem value="Viewing Booked">Viewing Booked</SelectItem>
              <SelectItem value="Viewed">Viewed</SelectItem>
              <SelectItem value="Offer Made">Offer Made</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Timeline Trigger (Optional)</Label>
        <Select 
          value={formData.triggerTimeline || "any"}
          onValueChange={(value) => setFormData({ ...formData, triggerTimeline: value === "any" ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any timeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any timeline</SelectItem>
            <SelectItem value="Within 28 days">Within 28 days</SelectItem>
            <SelectItem value="0-3 months">0-3 months</SelectItem>
            <SelectItem value="3-6 months">3-6 months</SelectItem>
            <SelectItem value="6-9 months">6-9 months</SelectItem>
            <SelectItem value="9-12 months">9-12 months</SelectItem>
            <SelectItem value="12+ months">12+ months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Delay (minutes after trigger, negative for before)</Label>
        <Input 
          type="number"
          value={formData.delayMinutes}
          onChange={(e) => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })}
        />
        <p className="text-xs text-muted-foreground">
          0 = instant, 60 = 1 hour after, -1440 = 24 hours before
        </p>
      </div>

      <div className="space-y-2">
        <Label>Message Content</Label>
        <Textarea 
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Hi {{name}}! Thanks for your interest..."
          rows={6}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Template
        </Button>
      </div>
    </form>
  );
};

export default WhatsAppAutomation;
