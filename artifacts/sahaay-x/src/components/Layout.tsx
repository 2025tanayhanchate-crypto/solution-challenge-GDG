import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Package, 
  Building2, 
  FileText, 
  Bot, 
  Settings,
  LogOut,
  Bell,
  Globe
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import FloatingChat from "./FloatingChat";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/volunteers", icon: Users, label: "Volunteers" },
    { href: "/missions", icon: Target, label: "Missions Control" },
    { href: "/resources", icon: Package, label: "Resources" },
    { href: "/ngos", icon: Building2, label: "NGOs" },
    { href: "/reports", icon: FileText, label: "Reports" },
    { href: "/assistant", icon: Bot, label: "AI Assistant" },
    { href: "/profile", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-[72px] md:w-64 border-r border-sidebar-border bg-sidebar flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
            SX
          </div>
          <span className="hidden md:block ml-3 font-display font-bold text-xl tracking-tight">SahaayX</span>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 md:px-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={`flex items-center justify-center md:justify-start h-10 md:px-3 rounded-md cursor-pointer transition-colors ${
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="hidden md:block ml-3 text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl font-semibold hidden sm:block">
              {navItems.find(i => i.href === location)?.label || "SahaayX"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
              <Globe className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
            <div className="h-8 w-px bg-border mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{user?.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</span>
              </div>
              <Avatar className="w-9 h-9 border border-border">
                <AvatarFallback className="bg-primary/20 text-primary">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout" className="text-muted-foreground hover:text-destructive ml-1">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto relative">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      <FloatingChat />
    </div>
  );
}
