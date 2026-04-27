import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Activity, Users, Shield } from "lucide-react";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("volunteer");
  
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ data: { email, password } }, {
        onSuccess: (res) => {
          login(res.token, res.user);
          setLocation("/dashboard");
        },
        onError: (err) => {
          toast({ title: "Login failed", description: err.message, variant: "destructive" });
        }
      });
    } else {
      registerMutation.mutate({ data: { name, email, password, role: role as any } }, {
        onSuccess: (res) => {
          login(res.token, res.user);
          setLocation("/dashboard");
        },
        onError: (err) => {
          toast({ title: "Registration failed", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden bg-background">
      {/* Animated Orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      {/* Left side - Hero */}
      <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative z-10 border-b md:border-b-0 md:border-r border-border bg-background/40 backdrop-blur-3xl">
        <div className="max-w-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              SX
            </div>
            <ShieldAlert className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">SahaayX</h1>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6 text-foreground">
            Smart Resource Allocation & Volunteer Coordination
          </h2>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-lg leading-relaxed">
            India's unified platform for disaster relief, social welfare missions, and community resource allocation. Built for precision, speed, and scale.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 flex flex-col gap-2">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-3xl font-mono font-bold">12,450+</span>
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Active Volunteers</span>
            </div>
            <div className="glass-card p-6 flex flex-col gap-2">
              <Activity className="w-6 h-6 text-secondary" />
              <span className="text-3xl font-mono font-bold">482</span>
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Critical Missions</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-16 text-xs text-muted-foreground font-mono flex items-center gap-4">
          <Shield className="w-4 h-4" />
          <span>CERT-IN Compliant Infrastructure</span>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-[480px] lg:w-[540px] p-8 md:p-12 flex flex-col justify-center relative z-10 bg-card/40 backdrop-blur-xl">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h3 className="text-2xl font-display font-semibold mb-2">
              {isLogin ? "Secure Access" : "Join the Network"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Enter your credentials to access the command center." : "Register to coordinate or volunteer for social impact."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="bg-background/50 border-white/10 h-11"
                  placeholder="Official Name"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <Input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="bg-background/50 border-white/10 h-11"
                placeholder="name@gov.in or org"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input 
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="bg-background/50 border-white/10 h-11"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role Designation</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-background/50 border-white/10 h-11">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volunteer">Volunteer Responder</SelectItem>
                    <SelectItem value="ngo_admin">NGO Administrator</SelectItem>
                    <SelectItem value="government">Government Official</SelectItem>
                    <SelectItem value="police">Law Enforcement</SelectItem>
                    <SelectItem value="academic">Academic / Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {loginMutation.isPending || registerMutation.isPending ? "Authenticating..." : (isLogin ? "Login to Dashboard" : "Register")}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {isLogin ? "Don't have an account? Register here" : "Already registered? Access command center"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Global Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 text-center text-xs text-muted-foreground/60 z-20 pointer-events-none">
        Powered by Google Gemini · Anthropic Claude | Built for Social Impact | © 2025 SahaayX | Data Privacy Policy
      </div>
    </div>
  );
}
