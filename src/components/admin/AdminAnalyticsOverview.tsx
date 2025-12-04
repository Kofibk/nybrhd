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
import { useState } from "react";

// Mock data for charts
const leadsOverTime = [
  { date: "Jan 1", leads: 45, spend: 1200 },
  { date: "Jan 8", leads: 62, spend: 1800 },
  { date: "Jan 15", leads: 78, spend: 2100 },
  { date: "Jan 22", leads: 95, spend: 2500 },
  { date: "Jan 29", leads: 112, spend: 2800 },
  { date: "Feb 5", leads: 128, spend: 3200 },
  { date: "Feb 12", leads: 145, spend: 3600 },
];

const clientTypeDistribution = [
  { name: "Developers", value: 45, color: "hsl(var(--primary))" },
  { name: "Estate Agents", value: 35, color: "hsl(var(--accent))" },
  { name: "Mortgage Brokers", value: 20, color: "hsl(var(--muted-foreground))" },
];

const topPerformingCampaigns = [
  { name: "Riverside Dev", leads: 156, cpl: 28.85 },
  { name: "Summer Launch", leads: 87, cpl: 36.78 },
  { name: "BTL Portfolio", leads: 57, cpl: 31.58 },
  { name: "Mayfair Collection", leads: 45, cpl: 46.67 },
  { name: "Int'l Mortgages", leads: 32, cpl: 46.88 },
];

const AdminAnalyticsOverview = () => {
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leadsOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
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
          </CardContent>
        </Card>

        {/* Spend Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ad Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `£${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`£${value}`, "Spend"]}
                />
                <Bar dataKey="spend" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads by Client Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
                  }}
                  formatter={(value: number) => [`${value}%`, "Share"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerformingCampaigns} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "leads" ? value : `£${value.toFixed(2)}`,
                    name === "leads" ? "Leads" : "CPL",
                  ]}
                />
                <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsOverview;
