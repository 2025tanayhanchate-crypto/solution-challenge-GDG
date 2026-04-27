import { useState } from "react";
import { useListMissions } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Users, MapPin, Calendar, Plus, AlertTriangle } from "lucide-react";

export default function Missions() {
  const { data: missions, isLoading } = useListMissions();
  
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-destructive text-destructive bg-destructive/10';
      case 'high': return 'border-accent text-accent bg-accent/10';
      case 'medium': return 'border-chart-4 text-chart-4 bg-chart-4/10';
      default: return 'border-secondary text-secondary bg-secondary/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Urgent Banner */}
      {missions?.some(m => m.urgency === 'critical' && m.status === 'active') && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
            <div>
              <h3 className="font-bold text-destructive">Critical Missions Active</h3>
              <p className="text-sm text-destructive/80">Immediate volunteer allocation required in affected districts.</p>
            </div>
          </div>
          <Button variant="destructive" size="sm">View Critical</Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Mission Control</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Mission
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))
        ) : (
          missions?.map((mission) => (
            <Card key={mission.id} className="glass-card bg-card/40 border-white/5 overflow-hidden group">
              <div className={`h-1 w-full ${mission.urgency === 'critical' ? 'bg-destructive' : mission.urgency === 'high' ? 'bg-accent' : 'bg-transparent'}`} />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider mb-2 ${getUrgencyColor(mission.urgency)}`}>
                      {mission.urgency} Priority
                    </Badge>
                    <h3 className="font-medium text-lg leading-tight">{mission.title}</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase bg-muted/50 border-white/10">
                    {mission.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 mb-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Target className="w-3.5 h-3.5" /> {mission.category}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <MapPin className="w-3.5 h-3.5" /> {mission.district}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5" /> 
                    {mission.startDate ? new Date(mission.startDate).toLocaleDateString() : 'Immediate'}
                  </div>
                </div>

                <div className="bg-background/50 rounded-lg p-3 border border-white/5">
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Volunteers
                    </span>
                    <span className="font-mono font-medium">{mission.volunteersAssigned} / {mission.volunteersNeeded}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${mission.volunteersAssigned >= mission.volunteersNeeded ? 'bg-secondary' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, (mission.volunteersAssigned / mission.volunteersNeeded) * 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
