import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, Mail, TrendingUp, Edit, Trash2, Copy } from "lucide-react";
import { useState } from "react";

interface DripEmail {
  id: string;
  name: string;
  delay: string;
  subject: string;
  openRate: string;
  clickRate: string;
  status: "active" | "draft" | "paused";
}

const mockDripSequences = [
  {
    id: "1",
    name: "New Lead Welcome Series",
    emails: 5,
    status: "active" as const,
    enrolled: 234,
    completed: 156,
    avgOpenRate: "42%",
    avgClickRate: "18%",
    emails_list: [
      {
        id: "e1",
        name: "Welcome & Introduction",
        delay: "Immediate",
        subject: "Welcome! Let's find your dream property",
        openRate: "68%",
        clickRate: "24%",
        status: "active" as const,
      },
      {
        id: "e2",
        name: "Property Showcase",
        delay: "1 day",
        subject: "Handpicked properties just for you",
        openRate: "45%",
        clickRate: "19%",
        status: "active" as const,
      },
      {
        id: "e3",
        name: "Neighborhood Guide",
        delay: "3 days",
        subject: "Discover the neighborhood lifestyle",
        openRate: "38%",
        clickRate: "15%",
        status: "active" as const,
      },
      {
        id: "e4",
        name: "Buyer's Guide & Tips",
        delay: "5 days",
        subject: "Your complete property buying guide",
        openRate: "32%",
        clickRate: "12%",
        status: "active" as const,
      },
      {
        id: "e5",
        name: "Booking Invitation",
        delay: "7 days",
        subject: "Ready to see your future home?",
        openRate: "28%",
        clickRate: "22%",
        status: "active" as const,
      },
    ],
  },
  {
    id: "2",
    name: "Post-Viewing Follow-up",
    emails: 3,
    status: "active" as const,
    enrolled: 89,
    completed: 67,
    avgOpenRate: "56%",
    avgClickRate: "31%",
    emails_list: [
      {
        id: "e6",
        name: "Thank You & Feedback",
        delay: "Immediate",
        subject: "Thanks for visiting - what did you think?",
        openRate: "72%",
        clickRate: "35%",
        status: "active" as const,
      },
      {
        id: "e7",
        name: "Financial Options",
        delay: "2 days",
        subject: "Flexible payment plans available",
        openRate: "51%",
        clickRate: "28%",
        status: "active" as const,
      },
      {
        id: "e8",
        name: "Similar Properties",
        delay: "5 days",
        subject: "Other properties you might love",
        openRate: "45%",
        clickRate: "30%",
        status: "active" as const,
      },
    ],
  },
  {
    id: "3",
    name: "Re-engagement Campaign",
    emails: 4,
    status: "paused" as const,
    enrolled: 156,
    completed: 45,
    avgOpenRate: "24%",
    avgClickRate: "8%",
    emails_list: [
      {
        id: "e9",
        name: "We Miss You",
        delay: "30 days",
        subject: "Still searching for your dream home?",
        openRate: "28%",
        clickRate: "9%",
        status: "paused" as const,
      },
      {
        id: "e10",
        name: "New Arrivals",
        delay: "7 days",
        subject: "Fresh properties just listed",
        openRate: "24%",
        clickRate: "8%",
        status: "paused" as const,
      },
      {
        id: "e11",
        name: "Special Offers",
        delay: "7 days",
        subject: "Exclusive offer just for you",
        openRate: "22%",
        clickRate: "7%",
        status: "paused" as const,
      },
      {
        id: "e12",
        name: "Final Outreach",
        delay: "14 days",
        subject: "Before you go...",
        openRate: "19%",
        clickRate: "6%",
        status: "paused" as const,
      },
    ],
  },
];

const EmailDripSequence = () => {
  const [selectedSequence, setSelectedSequence] = useState(mockDripSequences[0]);

  return (
    <div className="space-y-6">
      {/* Sequence Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        {mockDripSequences.map((sequence) => (
          <Card
            key={sequence.id}
            onClick={() => setSelectedSequence(sequence)}
            className={`p-4 cursor-pointer transition-all ${
              selectedSequence.id === sequence.id
                ? "border-primary shadow-md"
                : "hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold">{sequence.name}</h3>
              <Badge
                variant={
                  sequence.status === "active"
                    ? "default"
                    : "outline"
                }
              >
                {sequence.status}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emails:</span>
                <span className="font-medium">{sequence.emails}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrolled:</span>
                <span className="font-medium">{sequence.enrolled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Open Rate:</span>
                <span className="font-medium text-green-600">{sequence.avgOpenRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Click Rate:</span>
                <span className="font-medium text-blue-600">{sequence.avgClickRate}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sequence Detail */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">{selectedSequence.name}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedSequence.enrolled} leads enrolled • {selectedSequence.completed} completed
              the sequence
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Email
            </Button>
          </div>
        </div>

        {/* Email Timeline */}
        <div className="space-y-4">
          {selectedSequence.emails_list.map((email, index) => (
            <div key={email.id} className="relative">
              {/* Timeline connector */}
              {index < selectedSequence.emails_list.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border"></div>
              )}

              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Step indicator */}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>

                  {/* Email details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{email.name}</h4>
                        <p className="text-sm text-muted-foreground">{email.subject}</p>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        <Clock className="mr-1 h-3 w-3" />
                        {email.delay}
                      </Badge>
                    </div>

                    {/* Performance metrics */}
                    <div className="flex gap-6 mt-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          <span className="font-medium text-green-600">{email.openRate}</span>
                          <span className="text-muted-foreground"> open rate</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          <span className="font-medium text-blue-600">{email.clickRate}</span>
                          <span className="text-muted-foreground"> click rate</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Card>

      {/* Sequence Settings */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Sequence Settings</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="trigger">Enrollment Trigger</Label>
            <Select defaultValue="new-lead">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-lead">New lead submitted</SelectItem>
                <SelectItem value="viewing-scheduled">Viewing scheduled</SelectItem>
                <SelectItem value="viewing-completed">Viewing completed</SelectItem>
                <SelectItem value="manual">Manual enrollment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="exit">Exit Conditions</Label>
            <Select defaultValue="completed">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Sequence completed</SelectItem>
                <SelectItem value="converted">Lead converted</SelectItem>
                <SelectItem value="unsubscribed">Lead unsubscribed</SelectItem>
                <SelectItem value="manual">Manual removal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailDripSequence;
