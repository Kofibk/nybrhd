import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import BrokerDashboard from "./pages/BrokerDashboard";
import CampaignBuilder from "./components/CampaignBuilder";
import LeadsManagement from "./components/LeadsManagement";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Settings from "./pages/Settings";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Developer Routes */}
          <Route path="/developer" element={<DeveloperDashboard />} />
          <Route path="/developer/campaigns" element={
            <DashboardLayout title="Campaigns" userType="developer">
              <CampaignBuilder />
            </DashboardLayout>
          } />
          <Route path="/developer/leads" element={
            <DashboardLayout title="Leads" userType="developer">
              <LeadsManagement />
            </DashboardLayout>
          } />
          <Route path="/developer/analytics" element={
            <DashboardLayout title="Analytics" userType="developer">
              <AnalyticsDashboard />
            </DashboardLayout>
          } />
          <Route path="/developer/settings" element={<Settings userType="developer" />} />

          {/* Agent Routes */}
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/agent/campaigns" element={
            <DashboardLayout title="Campaigns" userType="agent">
              <CampaignBuilder />
            </DashboardLayout>
          } />
          <Route path="/agent/leads" element={
            <DashboardLayout title="Leads" userType="agent">
              <LeadsManagement />
            </DashboardLayout>
          } />
          <Route path="/agent/analytics" element={
            <DashboardLayout title="Analytics" userType="agent">
              <AnalyticsDashboard />
            </DashboardLayout>
          } />
          <Route path="/agent/settings" element={<Settings userType="agent" />} />

          {/* Broker/Mortgage Routes */}
          <Route path="/broker" element={<BrokerDashboard />} />
          <Route path="/broker/campaigns" element={
            <DashboardLayout title="Campaigns" userType="broker">
              <CampaignBuilder />
            </DashboardLayout>
          } />
          <Route path="/broker/leads" element={
            <DashboardLayout title="Leads" userType="broker">
              <LeadsManagement />
            </DashboardLayout>
          } />
          <Route path="/broker/analytics" element={
            <DashboardLayout title="Analytics" userType="broker">
              <AnalyticsDashboard />
            </DashboardLayout>
          } />
          <Route path="/broker/settings" element={<Settings userType="broker" />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
