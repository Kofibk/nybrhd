import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  Menu 
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogoWithTransparency } from "./LogoWithTransparency";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userType: "developer" | "agent" | "broker";
  userName?: string;
}

const DashboardLayout = ({ children, title, userType, userName = "User" }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const basePath = `/${userType}`;
  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: basePath },
    { name: "Campaigns", icon: Megaphone, href: `${basePath}/campaigns` },
    { name: "Leads", icon: Users, href: `${basePath}/leads` },
    { name: "Analytics", icon: BarChart3, href: `${basePath}/analytics` },
    { name: "Settings", icon: Settings, href: `${basePath}/settings` },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    navigate("/");
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo & Brand */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <LogoWithTransparency className="h-10 w-auto flex-shrink-0" variant="light" />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
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
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <aside 
        className="hidden lg:flex flex-col w-64"
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent isMobile />
            </SheetContent>
          </Sheet>
          
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          </div>
        </header>
        
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;