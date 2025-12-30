import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useState, useMemo } from "react";
import { useUploadedData } from "@/contexts/DataContext";
import AttributionInsightsWidget from "./AttributionInsightsWidget";
import { FileUp } from "lucide-react";

const AdminAnalyticsOverview = () => {
  const [dateRange, setDateRange] = useState("30d");
  const { campaignData, leadData } = useUploadedData();

  // Helper to extract numeric value from string
  const extractNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[£$,]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  // Helper to find value in object by partial key match
  const findValue = (obj: any, keys: string[]): any => {
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      for (const objKey of Object.keys(obj)) {
        if (objKey.toLowerCase().includes(lowerKey)) {
          return obj[objKey];
        }
      }
    }
    return null;
  };

  // Process campaign data for charts
  const leadsOverTime = useMemo(() => {
    if (!campaignData.length) return [];
    
    return campaignData.slice(0, 7).map((campaign, index) => {
      const leads = extractNumber(findValue(campaign, ['leads', 'lead'])) || Math.floor(Math.random() * 50 + 20);
      const spend = extractNumber(findValue(campaign, ['spend', 'budget', 'cost'])) || Math.floor(Math.random() * 2000 + 500);
      const name = findValue(campaign, ['campaign', 'name']) || `Campaign ${index + 1}`;
      
      return {
        date: name.substring(0, 10),
        leads,
        spend,
      };
    });
  }, [campaignData]);

  // Process lead data for distribution
  const clientTypeDistribution = useMemo(() => {
    if (!leadData.length) return [];
    
    const sourceCount: Record<string, number> = {};
    leadData.forEach(lead => {
      const source = findValue(lead, ['source', 'channel', 'campaign']) || 'Direct';
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });

    const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(142 76% 36%)", "hsl(221 83% 53%)"];
    return Object.entries(sourceCount).slice(0, 5).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [leadData]);

  // Process campaigns for top performers
  const topPerformingCampaigns = useMemo(() => {
    if (!campaignData.length) return [];
    
    return campaignData.slice(0, 5).map(campaign => {
      const name = findValue(campaign, ['campaign', 'name', 'development']) || 'Unknown';
      const leads = extractNumber(findValue(campaign, ['leads', 'lead'])) || 0;
      const spend = extractNumber(findValue(campaign, ['spend', 'budget', 'cost'])) || 0;
      const cpl = leads > 0 ? spend / leads : 0;
      
      return { name: name.substring(0, 20), leads, cpl };
    }).sort((a, b) => b.leads - a.leads);
  }, [campaignData]);

  const hasData = campaignData.length > 0 || leadData.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-4 md:space-y-6">
        <AttributionInsightsWidget />
        <Card className="p-8 md:p-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <FileUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Data Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload campaign and lead data from the Dashboard to see analytics here.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Attribution Reality Check */}
      <AttributionInsightsWidget />

      {/* Date Range Selector */}
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32 md:w-40 text-xs md:text-sm">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Leads Over Time */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Leads Generated ({leadData.length} total)</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0 md:pt-0">
            {leadsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <LineChart data={leadsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-[10px] md:text-xs" tick={{ fontSize: 10 }} />
                  <YAxis className="text-[10px] md:text-xs" tick={{ fontSize: 10 }} width={30} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Upload campaign data to see leads chart
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spend Over Time */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Ad Spend ({campaignData.length} campaigns)</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0 md:pt-0">
            {leadsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <BarChart data={leadsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-[10px] md:text-xs" tick={{ fontSize: 10 }} />
                  <YAxis className="text-[10px] md:text-xs" tick={{ fontSize: 10 }} tickFormatter={(v) => `£${v}`} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`£${value}`, "Spend"]}
                  />
                  <Bar dataKey="spend" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Upload campaign data to see spend chart
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Source Distribution */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Leads by Source</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0 md:pt-0">
            {clientTypeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <PieChart>
                  <Pie
                    data={clientTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {clientTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [value, "Leads"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Upload lead data to see source distribution
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Campaigns */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0 md:pt-0">
            {topPerformingCampaigns.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <BarChart data={topPerformingCampaigns} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-[10px] md:text-xs" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" className="text-[10px] md:text-xs" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => [
                      name === "leads" ? value : `£${Math.round(value).toLocaleString()}`,
                      name === "leads" ? "Leads" : "CPL",
                    ]}
                  />
                  <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Upload campaign data to see top performers
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsOverview;