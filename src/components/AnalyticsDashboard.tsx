import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Target, 
  MousePointer, Eye, UserCheck, Calendar, ArrowUpRight, Download
} from "lucide-react";

const AnalyticsDashboard = () => {
  const campaignPerformance = [
    {
      name: "Meta Ads - Lagos HNW",
      spend: "£2,500",
      leads: 124,
      cost_per_lead: "£20.16",
      conversion_rate: "3.2%",
      roi: "4.2x",
      trend: "up"
    },
    {
      name: "Google Ads - UK Investors",
      spend: "£1,800",
      leads: 89,
      cost_per_lead: "£20.22",
      conversion_rate: "2.8%",
      roi: "3.8x",
      trend: "up"
    },
    {
      name: "LinkedIn - Dubai Expats",
      spend: "£1,200",
      leads: 56,
      cost_per_lead: "£21.43",
      conversion_rate: "4.1%",
      roi: "3.5x",
      trend: "down"
    },
    {
      name: "Instagram - Lifestyle",
      spend: "£800",
      leads: 45,
      cost_per_lead: "£17.78",
      conversion_rate: "2.1%",
      roi: "2.9x",
      trend: "up"
    }
  ];

  const leadMetrics = {
    total_leads: 847,
    new_this_week: 124,
    qualified: 156,
    viewing_booked: 89,
    offers_made: 34,
    closed_deals: 12,
    avg_time_to_qualify: "2.3 days",
    avg_time_to_convert: "45 days"
  };

  const channelBreakdown = [
    { channel: "Meta Ads", percentage: 35, leads: 296, color: "bg-blue-500" },
    { channel: "Google Ads", percentage: 28, leads: 237, color: "bg-red-500" },
    { channel: "LinkedIn", percentage: 18, leads: 152, color: "bg-cyan-500" },
    { channel: "Organic", percentage: 12, leads: 102, color: "bg-green-500" },
    { channel: "Referral", percentage: 7, leads: 60, color: "bg-purple-500" }
  ];

  const salesFunnel = [
    { stage: "Total Leads", count: 847, percentage: 100, conversion: null },
    { stage: "Qualified", count: 156, percentage: 18.4, conversion: "18.4%" },
    { stage: "Viewing Booked", count: 89, percentage: 10.5, conversion: "57.1%" },
    { stage: "Offers Made", count: 34, percentage: 4.0, conversion: "38.2%" },
    { stage: "Closed Deals", count: 12, percentage: 1.4, conversion: "35.3%" }
  ];

  const propertyPerformance = [
    { property: "Marina Heights", views: 2340, inquiries: 156, viewings: 45, offers: 12, sold: 4 },
    { property: "Skyline Tower", views: 1890, inquiries: 124, viewings: 38, offers: 9, sold: 3 },
    { property: "Riverside Plaza", views: 1650, inquiries: 98, viewings: 28, offers: 7, sold: 2 },
    { property: "Garden Residences", views: 1420, inquiries: 87, viewings: 22, offers: 6, sold: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Insights</h2>
          <p className="text-muted-foreground">Comprehensive performance tracking across campaigns and leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-primary" />
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +18%
            </div>
          </div>
          <div className="text-2xl font-bold">{leadMetrics.total_leads}</div>
          <div className="text-sm text-muted-foreground">Total Leads</div>
          <div className="text-xs text-muted-foreground mt-1">
            +{leadMetrics.new_this_week} this week
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-primary" />
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12%
            </div>
          </div>
          <div className="text-2xl font-bold">{leadMetrics.qualified}</div>
          <div className="text-sm text-muted-foreground">Qualified Leads</div>
          <div className="text-xs text-muted-foreground mt-1">
            {((leadMetrics.qualified / leadMetrics.total_leads) * 100).toFixed(1)}% conversion
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8%
            </div>
          </div>
          <div className="text-2xl font-bold">{leadMetrics.closed_deals}</div>
          <div className="text-sm text-muted-foreground">Closed Deals</div>
          <div className="text-xs text-muted-foreground mt-1">
            {((leadMetrics.closed_deals / leadMetrics.total_leads) * 100).toFixed(1)}% overall conversion
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +24%
            </div>
          </div>
          <div className="text-2xl font-bold">3.8x</div>
          <div className="text-sm text-muted-foreground">Avg ROI</div>
          <div className="text-xs text-muted-foreground mt-1">
            Across all campaigns
          </div>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="funnel">Sales Funnel</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Campaign Performance */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Campaign Performance</h3>
            <div className="space-y-4">
              {campaignPerformance.map((campaign, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold">{campaign.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Spend: {campaign.spend}</span>
                        <span>•</span>
                        <span>{campaign.leads} leads</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{campaign.roi}</div>
                      <div className="text-xs text-muted-foreground">ROI</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Cost/Lead</div>
                      <div className="font-medium">{campaign.cost_per_lead}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Conversion</div>
                      <div className="font-medium">{campaign.conversion_rate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Trend</div>
                      <div className="flex items-center">
                        {campaign.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Channel Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Lead Source Distribution</h3>
            <div className="space-y-4">
              {channelBreakdown.map((channel, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{channel.channel}</span>
                    <span className="text-muted-foreground">
                      {channel.leads} leads ({channel.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${channel.color} transition-all`}
                      style={{ width: `${channel.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Lead Flow Metrics */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Lead Flow Metrics</h3>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Time to Qualify</span>
                    <span className="text-xl font-bold">{leadMetrics.avg_time_to_qualify}</span>
                  </div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Time to Convert</span>
                    <span className="text-xl font-bold">{leadMetrics.avg_time_to_convert}</span>
                  </div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Lead Velocity</span>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-5 w-5 mr-1" />
                      <span className="text-xl font-bold">+18%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Lead Quality Score */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Lead Quality Distribution</h3>
              <div className="space-y-4">
                {[
                  { quality: "High Quality (75-100)", count: 234, percentage: 28 },
                  { quality: "Medium Quality (50-74)", count: 398, percentage: 47 },
                  { quality: "Low Quality (0-49)", count: 215, percentage: 25 }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{item.quality}</span>
                      <span className="text-muted-foreground">
                        {item.count} leads ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-3" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Lead Sources Performance */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Top Performing Lead Sources</h3>
            <div className="space-y-3">
              {[
                { source: "Meta Campaign - Lagos HNW", leads: 124, quality: 82, conversion: "22%" },
                { source: "Google Ads - UK Investors", leads: 89, quality: 78, conversion: "19%" },
                { source: "LinkedIn - Dubai Expats", leads: 56, quality: 85, conversion: "24%" },
                { source: "Website - Organic Search", leads: 102, quality: 68, conversion: "12%" },
                { source: "Referral Program", leads: 60, quality: 88, conversion: "28%" }
              ].map((source, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{source.source}</h4>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Leads</div>
                      <div className="font-medium">{source.leads}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Quality</div>
                      <div className="font-medium">{source.quality}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Conversion</div>
                      <div className="font-medium">{source.conversion}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          {/* Sales Funnel */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Sales Conversion Funnel</h3>
            <div className="space-y-4">
              {salesFunnel.map((stage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-bold">{stage.stage}</span>
                      {stage.conversion && (
                        <span className="text-muted-foreground ml-2">
                          ({stage.conversion} conversion from previous)
                        </span>
                      )}
                    </div>
                    <span className="font-medium">
                      {stage.count} ({stage.percentage.toFixed(1)}% of total)
                    </span>
                  </div>
                  <div className="h-8 bg-secondary rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all flex items-center justify-center text-white font-bold"
                      style={{ width: `${stage.percentage}%` }}
                    >
                      {stage.percentage > 15 && stage.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Funnel Drop-off Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Drop-off Points</h3>
              <div className="space-y-3">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-yellow-900 mb-1">Leads → Qualified</div>
                  <div className="text-sm text-yellow-800">
                    81.6% drop-off rate. Consider improving lead qualification process.
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">Qualified → Viewing</div>
                  <div className="text-sm text-blue-800">
                    42.9% drop-off rate. Strong conversion at this stage.
                  </div>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="font-medium text-orange-900 mb-1">Viewing → Offer</div>
                  <div className="text-sm text-orange-800">
                    61.8% drop-off rate. Focus on follow-up after viewings.
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Funnel Optimization Tips</h3>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-primary pl-4">
                  <div className="font-medium mb-1">Improve Lead Quality</div>
                  <div className="text-sm text-muted-foreground">
                    Use AI scoring to focus on high-intent leads earlier
                  </div>
                </div>
                <div className="p-3 border-l-4 border-primary pl-4">
                  <div className="font-medium mb-1">Automate Follow-ups</div>
                  <div className="text-sm text-muted-foreground">
                    Set up automated nurture campaigns for viewing attendees
                  </div>
                </div>
                <div className="p-3 border-l-4 border-primary pl-4">
                  <div className="font-medium mb-1">Personalize Outreach</div>
                  <div className="text-sm text-muted-foreground">
                    Tailor communications based on buyer preferences and behavior
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Property Performance Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Property</th>
                    <th className="text-right py-3 px-4 font-medium">Views</th>
                    <th className="text-right py-3 px-4 font-medium">Inquiries</th>
                    <th className="text-right py-3 px-4 font-medium">Viewings</th>
                    <th className="text-right py-3 px-4 font-medium">Offers</th>
                    <th className="text-right py-3 px-4 font-medium">Sold</th>
                    <th className="text-right py-3 px-4 font-medium">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyPerformance.map((property, index) => (
                    <tr key={index} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-3 px-4 font-medium">{property.property}</td>
                      <td className="text-right py-3 px-4">{property.views}</td>
                      <td className="text-right py-3 px-4">{property.inquiries}</td>
                      <td className="text-right py-3 px-4">{property.viewings}</td>
                      <td className="text-right py-3 px-4">{property.offers}</td>
                      <td className="text-right py-3 px-4 font-bold">{property.sold}</td>
                      <td className="text-right py-3 px-4 text-green-600 font-medium">
                        {((property.sold / property.views) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold">Most Viewed</h3>
              </div>
              <div className="text-3xl font-bold mb-2">Marina Heights</div>
              <div className="text-muted-foreground">2,340 views this month</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MousePointer className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold">Highest Engagement</h3>
              </div>
              <div className="text-3xl font-bold mb-2">Skyline Tower</div>
              <div className="text-muted-foreground">6.6% inquiry rate</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold">Best Conversion</h3>
              </div>
              <div className="text-3xl font-bold mb-2">Garden Residences</div>
              <div className="text-muted-foreground">0.21% view-to-sale rate</div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
