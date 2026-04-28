import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListMissions, useCreateMission, getListMissionsQueryKey } from "@workspace/api-client-react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Target, Users, MapPin, Calendar, Plus, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Missions() {
  const { t } = useApp();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: missions, isLoading } = useListMissions();
  const createMutation = useCreateMission();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "Disaster Relief", district: "",
    urgency: "medium", requiredSkills: "", volunteersNeeded: "10",
  });

  const getUrgencyColor = (urgency: string) => {
    if (urgency === "critical") return "border-red-500/60 text-red-500 bg-red-500/8";
    if (urgency === "high") return "border-orange-500/60 text-orange-500 bg-orange-500/8";
    if (urgency === "medium") return "border-primary/60 text-primary bg-primary/8";
    return "border-green-500/50 text-green-500 bg-green-500/5";
  };

  const getUrgencyTopBar = (urgency: string) => {
    if (urgency === "critical") return "bg-red-500";
    if (urgency === "high") return "bg-orange-500";
    if (urgency === "medium") return "bg-primary";
    return "bg-green-500";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        title: form.title,
        description: form.description,
        category: form.category,
        district: form.district,
        urgency: form.urgency as any,
        requiredSkills: form.requiredSkills.split(",").map(s => s.trim()).filter(Boolean) as any,
        volunteersNeeded: parseInt(form.volunteersNeeded) || 10,
      }
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListMissionsQueryKey() });
        qc.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
        toast({ title: "Mission created successfully" });
        setShowForm(false);
        setForm({ title: "", description: "", category: "Disaster Relief", district: "", urgency: "medium", requiredSkills: "", volunteersNeeded: "10" });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const criticalActive = missions?.filter(m => m.urgency === "critical" && m.status === "active") || [];

  return (
    <div className="space-y-5">
      {criticalActive.length > 0 && (
        <div className="bg-red-500/8 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
            <div>
              <h3 className="font-semibold text-red-500 text-sm">Critical Missions Active — {criticalActive.length} district(s) affected</h3>
              <p className="text-xs text-red-500/70 mt-0.5">Immediate volunteer allocation required.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">{t.missionControl}</h2>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />{t.createMission}
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-5 relative">
          <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-display font-semibold text-lg mb-4">{t.createMission}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.title} *</label>
              <Input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                placeholder="Mission title" className="bg-background border-border" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.description}</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                placeholder="Mission objectives and context..." className="bg-background border-border resize-none" rows={3} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.category} *</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Disaster Relief", "Healthcare", "Education", "Environment", "Welfare", "Security"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.district} *</label>
              <Input required value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))}
                placeholder="e.g. Guwahati" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.urgency}</label>
              <Select value={form.urgency} onValueChange={v => setForm(f => ({...f, urgency: v}))}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">{t.critical}</SelectItem>
                  <SelectItem value="high">{t.high}</SelectItem>
                  <SelectItem value="medium">{t.medium}</SelectItem>
                  <SelectItem value="low">{t.low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.volunteersNeeded}</label>
              <Input type="number" min="1" value={form.volunteersNeeded} onChange={e => setForm(f => ({...f, volunteersNeeded: e.target.value}))}
                className="bg-background border-border" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.skills} required (comma separated)</label>
              <Input value={form.requiredSkills} onChange={e => setForm(f => ({...f, requiredSkills: e.target.value}))}
                placeholder="First Aid, Logistics, Medical" className="bg-background border-border" />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : t.createMission}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t.cancel}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />) : (
          missions?.map(mission => (
            <Card key={mission.id} className="glass-card border-border/60 overflow-hidden hover:border-primary/20 transition-all">
              <div className={`h-0.5 w-full ${getUrgencyTopBar(mission.urgency)}`} />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider mb-2 ${getUrgencyColor(mission.urgency)}`}>
                      {mission.urgency} priority
                    </Badge>
                    <h3 className="font-medium leading-tight">{mission.title}</h3>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-mono uppercase shrink-0 ml-3 ${
                    mission.status === "completed" ? "border-green-500/50 text-green-500" :
                    mission.status === "active" ? "border-primary/50 text-primary" :
                    "border-muted-foreground/40 text-muted-foreground"
                  }`}>
                    {mission.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-y-1.5 mb-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-mono"><Target className="w-3 h-3" /> {mission.category}</div>
                  <div className="flex items-center gap-1.5 font-mono"><MapPin className="w-3 h-3" /> {mission.district}</div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3 h-3" />
                    {mission.startDate ? new Date(mission.startDate).toLocaleDateString() : "Immediate"}
                  </div>
                </div>

                <div className="bg-background/60 rounded-lg p-3 border border-border/50">
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Volunteers</span>
                    <span className="font-mono font-medium">{mission.volunteersAssigned}/{mission.volunteersNeeded}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${mission.volunteersAssigned >= mission.volunteersNeeded ? "bg-green-500" : "bg-primary"}`}
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
