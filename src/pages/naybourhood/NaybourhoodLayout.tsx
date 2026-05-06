import { NavLink, Outlet, Link } from 'react-router-dom';
import { Home, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NaybourhoodLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/naybourhood" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[hsl(var(--nb-teal))] flex items-center justify-center text-[hsl(var(--nb-teal-foreground))] font-semibold text-sm">
              N
            </div>
            <span className="font-semibold tracking-tight">Naybourhood</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">· Buyer Intelligence</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavItem to="/naybourhood" end icon={Home}>Lead Inbox</NavItem>
            <NavItem to="/naybourhood/buyers" icon={Users}>Buyers</NavItem>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, end, icon: Icon, children }: any) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
          isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
        )
      }
    >
      <Icon className="h-4 w-4" />
      {children}
    </NavLink>
  );
}
