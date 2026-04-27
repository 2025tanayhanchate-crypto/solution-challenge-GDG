import { useAuth } from "@/contexts/AuthContext";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Shield, Calendar, QrCode } from "lucide-react";

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const { data: user, isLoading } = useGetCurrentUser();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="font-display text-2xl font-semibold mb-6">Profile Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="glass-card bg-card/40 border-white/5 text-center pt-6">
            <CardContent className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-3xl font-bold border border-primary/30 mb-4 shadow-xl shadow-primary/10">
                {authUser?.name?.charAt(0) || 'U'}
              </div>
              <h3 className="font-medium text-lg">{authUser?.name}</h3>
              <p className="text-sm text-muted-foreground capitalize mb-6">{authUser?.role?.replace('_', ' ')}</p>
              
              {authUser?.role === 'volunteer' && (
                <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                  <QrCode className="w-4 h-4 mr-2" /> Show ID Card
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card bg-card/40 border-white/5">
            <CardHeader>
              <CardTitle className="font-display text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <Input defaultValue={user?.name} className="bg-background/50 border-white/10" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </label>
                    <Input defaultValue={user?.email} disabled className="bg-background/50 border-white/10 opacity-70" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 mt-6">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Security Level</span>
                      <p className="text-sm font-mono">{user?.role}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined</span>
                      <p className="text-sm font-mono">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <Button variant="outline" className="border-white/10">Discard</Button>
                    <Button>Save Changes</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="destructive" onClick={logout} className="w-full md:w-auto">
              Sign Out Securely
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
