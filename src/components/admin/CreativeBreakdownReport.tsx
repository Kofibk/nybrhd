import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Image,
  Type,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  Eye,
  MousePointer,
  Users,
  DollarSign,
  Target,
  Sparkles,
} from "lucide-react";
import {
  MOCK_CREATIVE_PERFORMANCE,
  MOCK_HEADLINE_PERFORMANCE,
  type CreativePerformance,
  type HeadlinePerformance,
} from "@/lib/hybridSignalData";

interface CreativeBreakdownReportProps {
  campaignId?: string;
}

// Mock device performance data
const DEVICE_PERFORMANCE = [
  { 
    device: "mobile", 
    icon: Smartphone, 
    clicks: 4250, 
    leads: 128, 
    deals: 8, 
    dealRate: 6.25, 
    avgSessionTime: "1m 42s",
    topCreative: "Kitchen Walkthrough",
    topHeadline: "From £299k – Limited Units"
  },
  { 
    device: "desktop", 
    icon: Monitor, 
    clicks: 2180, 
    leads: 87, 
    deals: 14, 
    dealRate: 16.09, 
    avgSessionTime: "4m 18s",
    topCreative: "Floorplan Detail",
    topHeadline: "8% Guaranteed Yield"
  },
  { 
    device: "tablet", 
    icon: Tablet, 
    clicks: 890, 
    leads: 32, 
    deals: 3, 
    dealRate: 9.38, 
    avgSessionTime: "2m 55s",
    topCreative: "Lifestyle Carousel",
    topHeadline: "Stop Renting, Start Owning"
  },
];

const CreativeBreakdownReport = ({ campaignId }: CreativeBreakdownReportProps) => {
  const [activeTab, setActiveTab] = useState("creatives");

  const totalClicks = MOCK_CREATIVE_PERFORMANCE.reduce((sum, c) => sum + c.metrics.clicks, 0);
  const totalLeads = MOCK_CREATIVE_PERFORMANCE.reduce((sum, c) => sum + c.metrics.leads, 0);
  const totalDeals = MOCK_CREATIVE_PERFORMANCE.reduce((sum, c) => sum + c.metrics.deals, 0);
  const avgDealRate = totalLeads > 0 ? (totalDeals / totalLeads * 100) : 0;

  const getPerformanceColor = (value: number, threshold: number, higherIsBetter: boolean = true) => {
    if (higherIsBetter) {
      return value >= threshold ? "text-emerald-500" : "text-amber-500";
    }
    return value <= threshold ? "text-emerald-500" : "text-amber-500";
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Creative Breakdown Report</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs w-fit">
            <Sparkles className="h-3 w-3 mr-1" />
            Naybourhood Attribution
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Performance by creative element – showing what drives clicks vs. what drives deals
        </p>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase">Total Clicks</p>
            <p className="text-xl font-bold">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase">Total Leads</p>
            <p className="text-xl font-bold">{totalLeads}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase">Deals Closed</p>
            <p className="text-xl font-bold text-emerald-500">{totalDeals}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase">Avg Deal Rate</p>
            <p className="text-xl font-bold">{avgDealRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="creatives" className="gap-1 text-xs">
              <Image className="h-3 w-3" />
              Creatives
            </TabsTrigger>
            <TabsTrigger value="headlines" className="gap-1 text-xs">
              <Type className="h-3 w-3" />
              Headlines
            </TabsTrigger>
            <TabsTrigger value="devices" className="gap-1 text-xs">
              <Monitor className="h-3 w-3" />
              Devices
            </TabsTrigger>
          </TabsList>

          {/* Creatives Tab */}
          <TabsContent value="creatives" className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
              <Info className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Key Insight:</strong> High CTR ≠ High Deal Rate. The "Garden" image gets clicks, but "Floorplan" converts to actual sales.
              </p>
            </div>

            <div className="space-y-2">
              {MOCK_CREATIVE_PERFORMANCE.map((creative) => (
                <Card key={creative.creativeId} className="p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={creative.thumbnailUrl} 
                        alt={creative.creativeName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{creative.creativeName}</p>
                          <Badge variant="secondary" className="text-[10px]">
                            {creative.creativeType}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Clicks</p>
                          <p className="font-medium">{creative.metrics.clicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Leads</p>
                          <p className="font-medium">{creative.metrics.leads}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Deals</p>
                          <p className="font-medium text-emerald-500">{creative.metrics.deals}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CTR</p>
                          <p className={`font-medium ${getPerformanceColor(creative.metrics.ctr, 3)}`}>
                            {creative.metrics.ctr}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CPL</p>
                          <p className={`font-medium ${getPerformanceColor(creative.metrics.cpl, 25, false)}`}>
                            £{creative.metrics.cpl.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Deal Rate</p>
                          <div className="flex items-center gap-1">
                            <p className={`font-medium ${getPerformanceColor(creative.metrics.dealRate, 10)}`}>
                              {creative.metrics.dealRate}%
                            </p>
                            {creative.metrics.dealRate > 15 && (
                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Deal Rate Progress */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground">Deal Conversion</span>
                          <span className="font-medium">{creative.metrics.dealRate}% of leads → deals</span>
                        </div>
                        <Progress value={creative.metrics.dealRate * 5} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Headlines Tab */}
          <TabsContent value="headlines" className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
              <Info className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Key Insight:</strong> "8% Guaranteed Yield" has lowest CTR but highest Deal Rate (20%). Investors click less but buy more.
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Headline</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Deals</TableHead>
                  <TableHead className="text-right">Deal Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_HEADLINE_PERFORMANCE.map((headline) => (
                  <TableRow key={headline.headlineId}>
                    <TableCell className="font-medium text-xs max-w-[200px] truncate">
                      "{headline.headlineText}"
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {headline.metrics.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {headline.metrics.clicks.toLocaleString()}
                    </TableCell>
                    <TableCell className={`text-right text-xs font-medium ${getPerformanceColor(headline.metrics.ctr, 3.5)}`}>
                      {headline.metrics.ctr}%
                    </TableCell>
                    <TableCell className="text-right text-xs">{headline.metrics.leads}</TableCell>
                    <TableCell className="text-right text-xs text-emerald-500 font-medium">
                      {headline.metrics.deals}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={headline.metrics.dealRate >= 15 ? "default" : "secondary"}
                        className={`text-xs ${headline.metrics.dealRate >= 15 ? "bg-emerald-500" : ""}`}
                      >
                        {headline.metrics.dealRate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
              <Info className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Key Insight:</strong> Desktop users have 2.5x higher deal rate than mobile. They spend 4m 18s vs 1m 42s on average.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DEVICE_PERFORMANCE.map((device) => (
                <Card key={device.device} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <device.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{device.device}</p>
                      <p className="text-[10px] text-muted-foreground">Avg session: {device.avgSessionTime}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Clicks</span>
                      <span className="font-medium">{device.clicks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Leads</span>
                      <span className="font-medium">{device.leads}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Deals</span>
                      <span className="font-medium text-emerald-500">{device.deals}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t">
                      <span className="text-muted-foreground">Deal Rate</span>
                      <Badge 
                        variant={device.dealRate >= 10 ? "default" : "secondary"}
                        className={device.dealRate >= 10 ? "bg-emerald-500" : ""}
                      >
                        {device.dealRate}%
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <p className="text-[10px] text-muted-foreground mb-1">Top Performer</p>
                    <p className="text-xs font-medium truncate">{device.topCreative}</p>
                    <p className="text-[10px] text-muted-foreground truncate">"{device.topHeadline}"</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CreativeBreakdownReport;
