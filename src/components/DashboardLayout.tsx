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
  UserCog,
  Sparkles,
  MessageSquare,
  Heart,
  Zap,
  Lock,
  Phone,
  Mail,
  Shield
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogoWithTransparency } from "./LogoWithTransparency";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ProductTour } from "./ProductTour";
import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useAirtableBuyersForTable } from "@/hooks/useAirtableBuyers";
import { useAirtableCampaigns } from "@/hooks/useAirtable";
import { isTestEmail } from "@/lib/testAccounts";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userType: "developer" | "agent" | "broker" | "admin";
  userName?: string;
}

interface NavItem {
  name: string;
  icon: React.ElementType;
  href: string;
  tourId?: string;
  badge?: string | number;
  locked?: boolean;
  lockedBadge?: string;
}

const DashboardLayout = ({ children, title, userType, userName = "User" }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTier } = useSubscription();
  const { user } = useAuth();
  
  // Check if current user is a test account
  const isTestAccount = user?.email ? isTestEmail(user.email) : false;
  
  const basePath = `/${userType}`;

  // Real-time unread message count
  const { unreadCount: conversationCount } = useUnreadMessages();

  // Fetch real data for badge counts
  const { buyers } = useAirtableBuyersForTable({ enabled: true });
  const { data: campaignsData } = useAirtableCampaigns({ filterByFormula: "{status} = 'active'" });
  
  const buyerCount = buyers.length;
  const activeCampaignCount = campaignsData?.records?.length || 0;
  
  // Account manager info (hardcoded for now)
  const accountManager = {
    name: 'Your Account Manager',
    email: 'support@naybourhood.com',
    phone: '+44 XXX XXX XXXX',
    availability: 'Mon-Fri, 9am-6pm',
  };

  // Tier-specific navigation
  const getTieredNavigation = (): NavItem[] => {
    const baseNav: NavItem[] = [
      { 
        name: "Dashboard", 
        icon: LayoutDashboard, 
        href: basePath, 
        tourId: "dashboard" 
      },
      { 
        name: "Buyers", 
        icon: Users, 
        href: `${basePath}/buyers`, 
        tourId: "buyers",
        badge: buyerCount
      },
    ];

    // Conversations - all tiers
    baseNav.push({
      name: "Conversations",
      icon: MessageSquare,
      href: `${basePath}/conversations`,
      badge: conversationCount > 0 ? conversationCount : undefined
    });

    // My Matches - all tiers
    baseNav.push({
      name: "My Matches",
      icon: Heart,
      href: `${basePath}/matches`
    });

    // Campaigns - locked for Tier 1
    if (currentTier === 'access') {
      baseNav.push({
        name: "Campaigns",
        icon: Megaphone,
        href: `${basePath}/campaigns`,
        locked: true,
        lockedBadge: "Tier 2+"
      });
    } else {
      baseNav.push({
        name: "Campaigns",
        icon: Megaphone,
        href: `${basePath}/campaigns`,
        badge: activeCampaignCount > 0 ? activeCampaignCount : undefined
      });
    }

    // AI Insights - all tiers
    baseNav.push({
      name: "AI Insights",
      icon: Sparkles,
      href: `${basePath}/insights`,
      tourId: "insights"
    });

    // Settings - all tiers
    baseNav.push({
      name: "Settings",
      icon: Settings,
      href: `${basePath}/settings`,
      tourId: "settings"
    });

    // Admin Panel - test accounts only
    if (isTestAccount) {
      baseNav.push({
        name: "Admin Panel",
        icon: Shield,
        href: "/admin"
      });
    }

    return baseNav;
  };

  // Admin-specific navigation items
  const getAdminNavigation = (): NavItem[] => {
    if (userType !== 'admin') return [];
    return [
      { name: "Dashboard", icon: LayoutDashboard, href: basePath, tourId: "dashboard" },
      { name: "Campaigns", icon: Megaphone, href: `${basePath}/campaigns`, tourId: "campaigns" },
      { name: "Leads", icon: Users, href: `${basePath}/leads`, tourId: "leads" },
      { name: "Companies", icon: Building2, href: `${basePath}/companies`, tourId: "companies" },
      { name: "Users", icon: UserCog, href: `${basePath}/users`, tourId: "users" },
      { name: "Billing", icon: CreditCard, href: `${basePath}/billing`, tourId: "billing" },
      { name: "Analytics", icon: BarChart3, href: `${basePath}/analytics`, tourId: "analytics" },
    ];
  };

  const navigation: NavItem[] = userType === 'admin' 
    ? [...getAdminNavigation(), { name: "Settings", icon: Settings, href: `${basePath}/settings`, tourId: "settings" }]
    : getTieredNavigation();

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    navigate("/");
  };

  const handleLockedClick = () => {
    // Could show upgrade modal here
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
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name} data-tour={item.tourId}>
              {item.locked ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-sidebar-foreground/40 cursor-not-allowed"
                  disabled
                  onClick={handleLockedClick}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                  <div className="ml-auto flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {item.lockedBadge && (
                      <Badge variant="outline" className="text-[9px] border-muted-foreground/30">
                        {item.lockedBadge}
                      </Badge>
                    )}
                  </div>
                </Button>
              ) : (
                <Link to={item.href} onClick={() => isMobile && setOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm transition-all",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                    {item.badge !== undefined && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto text-[10px] h-5 px-1.5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Account Manager - Tier 3 only */}
      {currentTier === 'enterprise' && userType !== 'admin' && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="p-3 rounded-lg bg-sidebar-accent/30">
            <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider mb-2">
              Account Manager
            </p>
            <p className="text-sm font-medium text-sidebar-foreground">{accountManager.name}</p>
            <p className="text-[10px] text-sidebar-foreground/60 mt-0.5">{accountManager.availability}</p>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs flex-1"
                onClick={() => window.location.href = `tel:${accountManager.phone}`}
              >
                <Phone className="h-3 w-3 mr-1" />
                Call
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs flex-1"
                onClick={() => window.location.href = `mailto:${accountManager.email}`}
              >
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
            </div>
          </div>
        </div>
      )}

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
          <header className="bg-card border-b border-border px-3 py-3 md:p-4 flex items-center gap-3 md:gap-4 flex-shrink-0 shadow-sm">
            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SidebarContent isMobile />
              </SheetContent>
            </Sheet>
            
            <div className="flex-1 min-w-0" data-tour="ai-insights">
              <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto p-3 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
