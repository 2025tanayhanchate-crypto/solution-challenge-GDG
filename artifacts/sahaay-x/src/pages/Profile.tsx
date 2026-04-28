import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Shield, Calendar, LogOut } from "lucide-react";

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const { t, theme, toggleTheme, lang, setLang } = useApp();
  const { data: user, isLoading } = useGetCurrentUser();

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      government: "border-blue-500/50 text-blue-400",
      ngo_admin: "border-green-500/50 text-green-400",
      volunteer: "border-primary/60 text-primary",
      police: "border-purple-500/50 text-purple-400",
      academic: "border-cyan-500/50 text-cyan-400",
    };
    return map[role] || "border-muted-foreground/40 text-muted-foreground";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h2 className="font-display text-xl font-semibold">{t.profileSettings}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-4">
          <Card className="glass-card border-border/50 text-center pt-6">
            <CardContent className="flex flex-col items-center pb-6">
              <div className="w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center text-3xl font-bold border border-primary/30 mb-4 gold-glow">
                {authUser?.name?.charAt(0) || "U"}
              </div>
              <h3 className="font-medium">{authUser?.name}</h3>
              <div className={`mt-1 text-xs font-mono px-2.5 py-0.5 rounded-full border ${roleBadge(authUser?.role || "")}`}>
                {authUser?.role?.replace("_", " ")}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">{t.theme}</p>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={toggleTheme}>
                  {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                </Button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2">{t.language}</p>
                <div className="flex gap-2">
                  <Button variant={lang === "en" ? "default" : "outline"} size="sm" className="flex-1 text-xs" onClick={() => setLang("en")}>
                    🇬🇧 English
                  </Button>
                  <Button variant={lang === "hi" ? "default" : "outline"} size="sm" className="flex-1 text-xs" onClick={() => setLang("hi")}>
                    🇮🇳 हिंदी
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">{t.accountInfo}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg border border-border/50">
                    <User className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t.fullName}</p>
                      <p className="text-sm font-medium">{user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg border border-border/50">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t.emailAddress}</p>
                      <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg border border-border/50">
                      <Shield className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Role</p>
                        <p className="text-sm font-mono capitalize">{user?.role?.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-background/60 rounded-lg border border-border/50">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Joined</p>
                        <p className="text-sm font-mono">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button variant="destructive" className="w-full" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out Securely
          </Button>
        </div>
      </div>
    </div>
  );
}
