import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, TrendingUp, TrendingDown, Users, MousePointer, XCircle } from "lucide-react";

const mockCampaignPerformance = [
  {
    id: "1",
    name: "Victoria Gardens Launch Campaign",
    sent: "2,450",
    delivered: "2,389",
    opened: "1,004",
    clicked: "428",
    bounced: "61",
    unsubscribed: "8",
    openRate: "42.0%",
    clickRate: "17.9%",
    bounceRate: "2.5%",
    status: "active" as const,
    sentDate: "Nov 20, 2024",
  },
  {
    id: "2",
    name: "Weekly Property Newsletter",
    sent: "5,678",
    delivered: "5,512",
    opened: "2,205",
    clicked: "772",
    bounced: "166",
    unsubscribed: "23",
    openRate: "40.0%",
    clickRate: "14.0%",
    bounceRate: "2.9%",
    status: "active" as const,
    sentDate: "Nov 18, 2024",
  },
  {
    id: "3",
    name: "International Buyer Outreach",
    sent: "834",
    delivered: "812",
    opened: "447",
    clicked: "223",
    bounced: "22",
    unsubscribed: "4",
    openRate: "55.0%",
    clickRate: "27.5%",
    bounceRate: "2.6%",
    status: "completed" as const,
    sentDate: "Nov 15, 2024",
  },
  {
    id: "4",
    name: "Price Drop Alert - Canary Wharf",
    sent: "1,245",
    delivered: "1,215",
    opened: "851",
    clicked: "486",
    bounced: "30",
    unsubscribed: "12",
    openRate: "70.0%",
    clickRate: "40.0%",
    bounceRate: "2.4%",
    status: "completed" as const,
    sentDate: "Nov 12, 2024",
  },
];

const EmailPerformance = () => {
  const totalStats = {
    sent: "10,207",
    avgOpenRate: "51.8%",
    avgClickRate: "24.9%",
    avgBounceRate: "2.6%",
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalStats.sent}</div>
              <div className="text-sm text-muted-foreground">Total Sent</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalStats.avgOpenRate}</div>
              <div className="text-sm text-muted-foreground">Avg Open Rate</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <MousePointer className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalStats.avgClickRate}</div>
              <div className="text-sm text-muted-foreground">Avg Click Rate</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalStats.avgBounceRate}</div>
              <div className="text-sm text-muted-foreground">Avg Bounce Rate</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6">Campaign Performance</h3>
        <div className="space-y-4">
          {mockCampaignPerformance.map((campaign) => (
            <Card key={campaign.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold mb-1">{campaign.name}</h4>
                  <p className="text-sm text-muted-foreground">Sent on {campaign.sentDate}</p>
                </div>
                <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                  {campaign.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Sent</div>
                  <div className="font-semibold">{campaign.sent}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Delivered</div>
                  <div className="font-semibold">{campaign.delivered}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Opened</div>
                  <div className="font-semibold text-green-600">{campaign.opened}</div>
                  <div className="text-xs text-muted-foreground">{campaign.openRate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Clicked</div>
                  <div className="font-semibold text-blue-600">{campaign.clicked}</div>
                  <div className="text-xs text-muted-foreground">{campaign.clickRate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Bounced</div>
                  <div className="font-semibold text-orange-600">{campaign.bounced}</div>
                  <div className="text-xs text-muted-foreground">{campaign.bounceRate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Unsubscribed</div>
                  <div className="font-semibold">{campaign.unsubscribed}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Top Performing Emails */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Top Performing Subject Lines</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Price Drop Alert - Canary Wharf Properties
                </p>
              </div>
              <Badge variant="default" className="ml-2">
                70% open
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Exclusive: New Development Launch Tomorrow
                </p>
              </div>
              <Badge variant="default" className="ml-2">
                65% open
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Your Personalized Property Matches Are Ready
                </p>
              </div>
              <Badge variant="default" className="ml-2">
                55% open
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Best Times to Send</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Tuesday, 10:00 AM</p>
                <p className="text-xs text-muted-foreground">Peak engagement time</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">58% open rate</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Thursday, 2:00 PM</p>
                <p className="text-xs text-muted-foreground">High click-through</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">54% open rate</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Saturday, 9:00 AM</p>
                <p className="text-xs text-muted-foreground">Weekend readers</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">48% open rate</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmailPerformance;
