import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Shield, Sun, Moon, Globe, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("volunteer");

  const { login } = useAuth();
  const { toggleTheme, theme, lang, setLang, t } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ data: { email, password } }, {
        onSuccess: (res) => { login(res.token, res.user); setLocation("/dashboard"); },
        onError: (err: any) => toast({ title: "Login failed", description: err.message, variant: "destructive" }),
      });
    } else {
      registerMutation.mutate({ data: { name, email, password, role: role as any } }, {
        onSuccess: (res) => { login(res.token, res.user); setLocation("/dashboard"); },
        onError: (err: any) => toast({ title: "Registration failed", description: err.message, variant: "destructive" }),
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden bg-background">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Top bar controls */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8 px-2 text-xs bg-card/40 backdrop-blur border border-border">
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase font-mono">{lang}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLang("en")}>🇬🇧 English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("hi")}>🇮🇳 हिंदी</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" className="h-8 w-8 bg-card/40 backdrop-blur border border-border text-muted-foreground hover:text-primary" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      {/* Left hero */}
      <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative z-10 border-b md:border-b-0 md:border-r border-border bg-background/40 backdrop-blur-3xl">
        <div className="max-w-xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg gold-glow">
              SX
            </div>
            <ShieldAlert className="w-7 h-7 text-primary" />
            <h1 className="font-display text-3xl font-bold tracking-tight gold-text">SahaayX</h1>
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
            {t.appTagline}
          </h2>

          <p className="text-lg text-muted-foreground mb-12 max-w-lg leading-relaxed">
            {t.appDesc}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 flex flex-col gap-2">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Active Volunteers</span>
              <span className="text-3xl font-mono font-bold text-primary">12,450+</span>
            </div>
            <div className="glass-card p-5 flex flex-col gap-2">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Critical Missions</span>
              <span className="text-3xl font-mono font-bold text-primary">482</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-16 text-xs text-muted-foreground font-mono flex items-center gap-3">
          <Shield className="w-4 h-4 text-primary/60" />
          <span>{t.certCompliant}</span>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full md:w-[460px] lg:w-[520px] p-8 md:p-12 flex flex-col justify-center relative z-10 bg-card/50 backdrop-blur-xl border-l border-border">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h3 className="text-2xl font-display font-semibold mb-2">
              {isLogin ? t.secureAccess : t.joinNetwork}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isLogin ? t.enterCredentials : t.registerDesc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.fullName}</label>
                <Input required value={name} onChange={e => setName(e.target.value)}
                  className="bg-background/60 border-border h-11" placeholder="Official Name" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.emailAddress}</label>
              <Input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="bg-background/60 border-border h-11" placeholder="name@gov.in or org" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.password}</label>
              <Input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="bg-background/60 border-border h-11" placeholder="••••••••" />
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.roleDesignation}</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-background/60 border-border h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volunteer">{t.volunteerRole}</SelectItem>
                    <SelectItem value="ngo_admin">{t.ngoAdminRole}</SelectItem>
                    <SelectItem value="government">{t.govRole}</SelectItem>
                    <SelectItem value="police">{t.policeRole}</SelectItem>
                    <SelectItem value="academic">{t.academicRole}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full h-11 mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gold-glow transition-all" disabled={isPending}>
              {isPending ? t.authenticating : (isLogin ? t.loginBtn : t.registerBtn)}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:text-primary/80 transition-colors">
              {isLogin ? t.noAccount : t.alreadyRegistered}
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 text-center text-xs text-muted-foreground/50 z-20 pointer-events-none font-mono">
        Powered by Google Gemini · Anthropic Claude | Built for Social Impact | © 2025 SahaayX
      </div>
    </div>
  );
}
