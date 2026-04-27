import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useGetDashboardSummary, 
  useGetRecentActivity, 
  useGetDistrictStats, 
  useListMissions 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Target, Package, Building2, Activity, MapPin, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { role } = useAuth();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity();
  const { data: districts, isLoading: loadingDistricts } = useGetDistrictStats();
  const { data: activeMissions, isLoading: loadingMissions } = useListMissions({ status: 'active' });

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Volunteers", value: summary?.activeVolunteers, icon: Users, color: "text-primary" },
          { label: "Active Missions", value: summary?.activeMissions, icon: Target, color: "text-destructive" },
          { label: "Total Resources", value: summary?.totalResources, icon: Package, color: "text-secondary" },
          { label: "Registered NGOs", value: summary?.totalNgos, icon: Building2, color: "text-accent" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card bg-card/40 border-white/5 shadow-xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                {loadingSummary ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <h3 className="text-3xl font-mono font-bold mt-1">{stat.value?.toLocaleString() || 0}</h3>
                )}
              </div>
              <div className={`p-4 rounded-xl bg-background/50 backdrop-blur-md border border-white/5 shadow-inner ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Chart */}
        <Card className="glass-card lg:col-span-2 bg-card/40 border-white/5">
          <CardHeader>
            <CardTitle className="font-display font-medium text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              District Resource Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDistricts ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districts || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="district" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                    />
                    <Bar dataKey="volunteers" name="Volunteers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resources" name="Resources" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="missions" name="Missions" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card bg-card/40 border-white/5">
          <CardHeader>
            <CardTitle className="font-display font-medium text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingActivity ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="h-[300px] overflow-y-auto px-6 pb-6 space-y-4 relative">
                <div className="absolute left-[31px] top-2 bottom-6 w-px bg-border/50"></div>
                {activity?.map((item) => (
                  <div key={item.id} className="flex gap-4 relative z-10">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5 ring-4 ring-background flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {item.district && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-white/10 font-mono">
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
      <Card className="glass-card bg-card/40 border-white/5">
        <CardHeader>
          <CardTitle className="font-display font-medium text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-destructive" />
            Critical & Active Missions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMissions ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMissions?.slice(0, 6).map(mission => (
                <div key={mission.id} className="p-4 rounded-xl bg-background/30 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`font-mono uppercase tracking-wider text-[10px] ${
                      mission.urgency === 'critical' ? 'border-destructive text-destructive' :
                      mission.urgency === 'high' ? 'border-accent text-accent' :
                      mission.urgency === 'medium' ? 'border-chart-4 text-chart-4' :
                      'border-secondary text-secondary'
                    }`}>
                      {mission.urgency}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">{mission.district}</span>
                  </div>
                  <h4 className="font-medium text-sm line-clamp-1 mb-1">{mission.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                    <span>{mission.volunteersAssigned} / {mission.volunteersNeeded} Vols</span>
                    <span className="font-mono">{mission.category}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (mission.volunteersAssigned / mission.volunteersNeeded) * 100)}%` }}
                    />
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
