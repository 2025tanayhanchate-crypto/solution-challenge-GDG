import { useApp } from "@/contexts/AppContext";
import {
  useGetDashboardSummary, useGetRecentActivity,
  useGetDistrictStats, useListMissions
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Package, Building2, Activity, MapPin, Clock, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
function StatCard({ label, value, icon: Icon, loading, accent = false }: {
  label: string; value?: number; icon: any; loading: boolean; accent?: boolean;
}) {
  return (
    <Card className="glass-card border-border/50 hover:border-primary/30 transition-all">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <h3 className={`text-3xl font-mono font-bold ${accent ? "text-primary" : ""}`}>
              {value?.toLocaleString() ?? 0}
            </h3>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { t, theme } = useApp();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity();
  const { data: districts, isLoading: loadingDistricts } = useGetDistrictStats();
  const { data: activeMissions, isLoading: loadingMissions } = useListMissions({ status: "active" });

  const tooltipStyle = {
    backgroundColor: theme === "dark" ? "#111" : "#fff",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.activeVolunteers} value={summary?.activeVolunteers} icon={Users} loading={loadingSummary} accent />
        <StatCard label={t.activeMissions} value={summary?.activeMissions} icon={Target} loading={loadingSummary} />
        <StatCard label={t.totalResources} value={summary?.totalResources} icon={Package} loading={loadingSummary} />
        <StatCard label={t.registeredNgos} value={summary?.totalNgos} icon={Building2} loading={loadingSummary} />
      </div>

      {/* Impact row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex flex-col gap-1 col-span-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Impact Hours</span>
          <span className="text-2xl font-mono font-bold text-primary">{loadingSummary ? "—" : summary?.totalImpactHours?.toLocaleString()}</span>
        </div>
        <div className="glass-card p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Beneficiaries</span>
          <span className="text-2xl font-mono font-bold text-primary">{loadingSummary ? "—" : summary?.beneficiariesReached?.toLocaleString()}</span>
        </div>
        <div className="glass-card p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Completed</span>
          <span className="text-2xl font-mono font-bold text-green-500">{loadingSummary ? "—" : summary?.completedMissions}</span>
        </div>
        <div className="glass-card p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Critical Open</span>
          <span className="text-2xl font-mono font-bold text-red-500">{loadingSummary ? "—" : summary?.criticalMissions}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <Card className="glass-card lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t.districtDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDistricts ? <Skeleton className="h-64 w-full" /> : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districts || []} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.06)" vertical={false} />
                    <XAxis dataKey="district" stroke="rgba(201,168,76,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(201,168,76,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(201,168,76,0.05)" }} />
                    <Bar dataKey="volunteers" name="Volunteers" fill="hsl(43,62%,54%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="missions" name="Missions" fill="hsl(0,70%,55%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="resources" name="Resources" fill="hsl(160,60%,45%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {t.liveActivity}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingActivity ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto px-5 pb-5 space-y-3">
                {activity?.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="text-xs leading-relaxed">{item.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {item.district && (
                          <Badge variant="outline" className="text-[9px] h-4 px-1 border-primary/20 text-primary/70 font-mono">
                            {item.district}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Missions */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            {t.criticalMissions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMissions ? <Skeleton className="h-32 w-full" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeMissions?.slice(0, 6).map(m => (
                <div key={m.id} className="p-4 rounded-lg bg-background/50 border border-border/60 hover:border-primary/25 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`font-mono uppercase tracking-wider text-[10px] ${
                      m.urgency === "critical" ? "border-red-500/50 text-red-500" :
                      m.urgency === "high" ? "border-orange-500/50 text-orange-500" :
                      "border-primary/50 text-primary"
                    }`}>
                      {m.urgency}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />{m.district}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium line-clamp-1 mb-2">{m.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mb-2">
                    <span>{m.volunteersAssigned}/{m.volunteersNeeded} vols</span>
                    <span>{m.category}</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, (m.volunteersAssigned / m.volunteersNeeded) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
