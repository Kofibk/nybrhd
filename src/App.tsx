import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { SplashScreen } from "./components/SplashScreen";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import HowItWorks from "./pages/HowItWorks";
import Solutions from "./pages/Solutions";
import About from "./pages/About";
import CaseStudies from "./pages/CaseStudies";
import Resources from "./pages/Resources";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import BrokerDashboard from "./pages/BrokerDashboard";
import DevelopmentsPage from "./pages/DevelopmentsPage";
import PropertiesPage from "./pages/PropertiesPage";
import ProductsPage from "./pages/ProductsPage";
import CampaignsList from "./pages/CampaignsList";
import CampaignWizard from "./pages/CampaignWizard";
import CampaignDetail from "./pages/CampaignDetail";
import LeadsManagement from "./components/LeadsManagement";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Settings from "./pages/Settings";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClientDetail from "./pages/admin/ClientDetail";
import AdminRoute from "./components/admin/AdminRoute";
import AirtableTest from "./pages/AirtableTest";
import AITestPage from "./pages/AITestPage";

const queryClient = new QueryClient();

// Demo mode - no authentication required
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Demo mode - direct access to landing, login still available if needed */}
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/about" element={<About />} />
      <Route path="/case-studies" element={<CaseStudies />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Developer Routes */}
      <Route path="/developer" element={<ProtectedRoute><DeveloperDashboard /></ProtectedRoute>} />
      <Route path="/developer/developments" element={<ProtectedRoute><DevelopmentsPage /></ProtectedRoute>} />
      <Route path="/developer/campaigns" element={<ProtectedRoute><CampaignsList userType="developer" /></ProtectedRoute>} />
      <Route path="/developer/campaigns/new" element={<ProtectedRoute><CampaignWizard userType="developer" /></ProtectedRoute>} />
      <Route path="/developer/campaigns/:id" element={<ProtectedRoute><CampaignDetail userType="developer" /></ProtectedRoute>} />
      <Route path="/developer/leads" element={
        <ProtectedRoute>
          <DashboardLayout title="Leads" userType="developer">
            <LeadsManagement userType="developer" />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/developer/analytics" element={
        <ProtectedRoute>
          <DashboardLayout title="Analytics" userType="developer">
            <AnalyticsDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/developer/settings" element={<ProtectedRoute><Settings userType="developer" /></ProtectedRoute>} />

      {/* Agent Routes */}
      <Route path="/agent" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
      <Route path="/agent/properties" element={<ProtectedRoute><PropertiesPage /></ProtectedRoute>} />
      <Route path="/agent/campaigns" element={<ProtectedRoute><CampaignsList userType="agent" /></ProtectedRoute>} />
      <Route path="/agent/campaigns/new" element={<ProtectedRoute><CampaignWizard userType="agent" /></ProtectedRoute>} />
      <Route path="/agent/campaigns/:id" element={<ProtectedRoute><CampaignDetail userType="agent" /></ProtectedRoute>} />
      <Route path="/agent/leads" element={
        <ProtectedRoute>
          <DashboardLayout title="Leads" userType="agent">
            <LeadsManagement userType="agent" />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/agent/analytics" element={
        <ProtectedRoute>
          <DashboardLayout title="Analytics" userType="agent">
            <AnalyticsDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/agent/settings" element={<ProtectedRoute><Settings userType="agent" /></ProtectedRoute>} />

      {/* Broker Routes */}
      <Route path="/broker" element={<ProtectedRoute><BrokerDashboard /></ProtectedRoute>} />
      <Route path="/broker/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/broker/campaigns" element={<ProtectedRoute><CampaignsList userType="broker" /></ProtectedRoute>} />
      <Route path="/broker/campaigns/new" element={<ProtectedRoute><CampaignWizard userType="broker" /></ProtectedRoute>} />
      <Route path="/broker/campaigns/:id" element={<ProtectedRoute><CampaignDetail userType="broker" /></ProtectedRoute>} />
      <Route path="/broker/leads" element={
        <ProtectedRoute>
          <DashboardLayout title="Leads" userType="broker">
            <LeadsManagement userType="broker" />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/broker/analytics" element={
        <ProtectedRoute>
          <DashboardLayout title="Analytics" userType="broker">
            <AnalyticsDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/broker/settings" element={<ProtectedRoute><Settings userType="broker" /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/campaigns" element={<AdminRoute><CampaignsList userType="admin" /></AdminRoute>} />
      <Route path="/admin/campaigns/new" element={<AdminRoute><CampaignWizard userType="admin" /></AdminRoute>} />
      <Route path="/admin/campaigns/:id" element={<AdminRoute><CampaignDetail userType="admin" /></AdminRoute>} />
      <Route path="/admin/leads" element={
        <AdminRoute>
          <DashboardLayout title="Leads" userType="admin">
            <LeadsManagement userType="admin" />
          </DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/admin/analytics" element={
        <AdminRoute>
          <DashboardLayout title="Analytics" userType="admin">
            <AnalyticsDashboard />
          </DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/admin/settings" element={<AdminRoute><Settings userType="admin" /></AdminRoute>} />
      <Route path="/admin/clients/:clientId" element={<AdminRoute><ClientDetail /></AdminRoute>} />

      {/* Test Routes */}
      <Route path="/airtable-test" element={<AirtableTest />} />
      <Route path="/ai-test" element={<AITestPage />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [hasShownSplash, setHasShownSplash] = useState(() => {
    return sessionStorage.getItem("splashShown") === "true";
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("splashShown", "true");
  };

  // Skip splash if already shown this session
  useEffect(() => {
    if (hasShownSplash) {
      setShowSplash(false);
    }
  }, [hasShownSplash]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <InventoryProvider>
            <TooltipProvider>
              {showSplash && !hasShownSplash && (
                <SplashScreen onComplete={handleSplashComplete} />
              )}
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </InventoryProvider>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
