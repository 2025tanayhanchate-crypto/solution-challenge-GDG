import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Target, Package,
  Building2, FileText, Bot, Settings, LogOut,
  Bell, Sun, Moon, Globe, ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import FloatingChat from "./FloatingChat";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { toggleTheme, theme, lang, setLang, t } = useApp();
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t.dashboard },
    { href: "/volunteers", icon: Users, label: t.volunteers },
    { href: "/missions", icon: Target, label: t.missions },
    { href: "/resources", icon: Package, label: t.resources },
    { href: "/ngos", icon: Building2, label: t.ngos },
    { href: "/reports", icon: FileText, label: t.reports },
    { href: "/assistant", icon: Bot, label: t.aiAssistant },
    { href: "/profile", icon: Settings, label: t.settings },
  ];

  const currentPage = navItems.find(i => i.href === location);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-[64px] md:w-60 border-r border-sidebar-border bg-sidebar flex flex-col transition-all duration-300 shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center justify-center md:justify-start md:px-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm font-mono shrink-0">
            SX
          </div>
          <span className="hidden md:block ml-3 font-display font-bold text-lg tracking-tight gold-text">SahaayX</span>
        </div>

        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-1.5 md:px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center justify-center md:justify-start h-9 md:px-3 rounded-md cursor-pointer transition-all text-sm ${
                  isActive
                    ? "nav-active font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden md:block ml-3 truncate">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center md:justify-start gap-3 h-9 md:px-3 rounded-md text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden md:block">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <h1 className="font-display text-lg font-semibold hidden sm:block truncate">
            {currentPage?.label || "SahaayX"}
          </h1>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8 px-2 text-xs">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="uppercase font-mono">{lang}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[100px]">
                <DropdownMenuItem onClick={() => setLang("en")} className={lang === "en" ? "text-primary" : ""}>
                  🇬🇧 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("hi")} className={lang === "hi" ? "text-primary" : ""}>
                  🇮🇳 हिंदी
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full"></span>
            </Button>

            <div className="h-6 w-px bg-border mx-1"></div>

            {/* User */}
            <Link href="/profile">
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium leading-none">{user?.name}</span>
                  <span className="text-[10px] text-muted-foreground capitalize mt-0.5">{user?.role?.replace("_", " ")}</span>
                </div>
                <Avatar className="w-8 h-8 border border-primary/30 group-hover:border-primary/60 transition-colors">
                  <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      <FloatingChat />
    </div>
  );
}
