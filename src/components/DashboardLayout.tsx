import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, BarChart3, Users, Settings, LogOut, Sparkles, Menu } from "lucide-react";
import { ReactNode, useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userType: "developer" | "agent" | "broker";
}

const DashboardLayout = ({ children, title, userType }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);
  
  const navigation = [
    { name: "Dashboard", icon: Home, href: "#" },
    { name: "Campaigns", icon: Sparkles, href: "#" },
    { name: "Leads", icon: Users, href: "#" },
    { name: "Analytics", icon: BarChart3, href: "#" },
    { name: "Settings", icon: Settings, href: "#" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 sm:p-6 border-b border-border">
        <h2 className="text-xl sm:text-2xl font-bold text-primary">Naybourhood.ai</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 capitalize">{userType} Portal</p>
      </div>
      
      <nav className="flex-1 p-3 sm:p-4">
        <ul className="space-y-1 sm:space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm sm:text-base"
                onClick={() => setOpen(false)}
              >
                <item.icon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                {item.name}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 sm:p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground text-sm sm:text-base">
          <LogOut className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border p-4 sm:p-6 flex items-center gap-4">
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        </header>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
