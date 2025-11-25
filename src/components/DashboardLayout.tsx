import { Button } from "@/components/ui/button";
import { Home, BarChart3, Users, Settings, LogOut, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userType: "developer" | "agent" | "broker";
}

const DashboardLayout = ({ children, title, userType }: DashboardLayoutProps) => {
  const navigation = [
    { name: "Dashboard", icon: Home, href: "#" },
    { name: "Campaigns", icon: Sparkles, href: "#" },
    { name: "Leads", icon: Users, href: "#" },
    { name: "Analytics", icon: BarChart3, href: "#" },
    { name: "Settings", icon: Settings, href: "#" },
  ];

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-primary">Naybourhood.ai</h2>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{userType} Portal</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border p-6">
          <h1 className="text-3xl font-bold">{title}</h1>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
