import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  Building2,
  CreditCard,
  UserCog
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogoWithTransparency } from "./LogoWithTransparency";
import { useAuth } from "@/contexts/AuthContext";
import { ProductTour } from "./ProductTour";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userType: "developer" | "agent" | "broker" | "admin";
  userName?: string;
}

const DashboardLayout = ({ children, title, userType, userName = "User" }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const basePath = `/${userType}`;
  
  // Base navigation items for all user types
  const baseNavigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: basePath, tourId: "dashboard" },
    { name: "Campaigns", icon: Megaphone, href: `${basePath}/campaigns`, tourId: "campaigns" },
    { name: "Leads", icon: Users, href: `${basePath}/leads`, tourId: "leads" },
  ];
  
  // Admin-specific navigation items
  const adminNavigation = userType === 'admin' ? [
    { name: "Companies", icon: Building2, href: `${basePath}/companies`, tourId: "companies" },
    { name: "Users", icon: UserCog, href: `${basePath}/users`, tourId: "users" },
    { name: "Billing", icon: CreditCard, href: `${basePath}/billing`, tourId: "billing" },
  ] : [];
  
  // Common navigation items for all user types
  const commonNavigation = [
    { name: "Analytics", icon: BarChart3, href: `${basePath}/analytics`, tourId: "analytics" },
    { name: "Settings", icon: Settings, href: `${basePath}/settings`, tourId: "settings" },
  ];
  
  const navigation = [...baseNavigation, ...adminNavigation, ...commonNavigation];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    navigate("/");
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo & Brand */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/landing" className="flex items-center gap-3">
          <LogoWithTransparency className="h-10 w-auto flex-shrink-0" variant="white" />
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name} data-tour={item.tourId}>
              <Link to={item.href} onClick={() => isMobile && setOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm transition-all ${
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-sidebar-border space-y-3">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-sidebar-accent/50">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{userType}</p>
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the landing page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <>
      <ProductTour userType={userType} />
      <div className="h-screen bg-background flex w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <aside 
          className="hidden lg:flex flex-col w-64 flex-shrink-0"
        >
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="bg-card border-b border-border p-4 flex items-center gap-4 flex-shrink-0 shadow-sm">
            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SidebarContent isMobile />
              </SheetContent>
            </Sheet>
            
            <div className="flex-1" data-tour="ai-insights">
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;