import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListVolunteers, useCreateVolunteer, getListVolunteersQueryKey } from "@workspace/api-client-react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MapPin, Clock, Shield, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Volunteers() {
  const { t } = useApp();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", district: "", skills: "", availability: "weekends" });

  const { data: volunteers, isLoading } = useListVolunteers();
  const createMutation = useCreateVolunteer();

  const filtered = volunteers?.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.district.toLowerCase().includes(search.toLowerCase()) ||
    v.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        district: form.district,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean) as any,
        availability: form.availability,
      }
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListVolunteersQueryKey() });
        qc.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
        toast({ title: "Volunteer registered successfully" });
        setShowForm(false);
        setForm({ name: "", email: "", phone: "", district: "", skills: "", availability: "weekends" });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const badgeColor = (badge: string | null) => {
    if (badge === "platinum") return "border-blue-400 text-blue-400";
    if (badge === "gold") return "border-primary text-primary";
    if (badge === "silver") return "border-gray-400 text-gray-400";
    return "border-amber-700 text-amber-700";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border" />
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />{t.registerVolunteer}
        </Button>
      </div>

      {/* Inline Create Form */}
      {showForm && (
        <div className="glass-card p-5 relative">
          <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-display font-semibold text-lg mb-4">{t.registerVolunteer}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.name} *</label>
              <Input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Full name" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Email *</label>
              <Input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                placeholder="email@example.com" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.phone}</label>
              <Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                placeholder="+91 XXXXX XXXXX" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.district} *</label>
              <Input required value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))}
                placeholder="e.g. Mumbai" className="bg-background border-border" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.skills} (comma separated) *</label>
              <Input required value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))}
                placeholder="First Aid, Logistics, Medical" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.availability}</label>
              <Select value={form.availability} onValueChange={v => setForm(f => ({...f, availability: v}))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                  <SelectItem value="evenings">Evenings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Registering..." : t.registerVolunteer}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t.cancel}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground font-mono">
        <span>{volunteers?.length || 0} total</span>
        <span className="text-primary">{volunteers?.filter(v => v.status === "active").length || 0} active</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />) : (
          filtered?.map(v => (
            <Card key={v.id} className="glass-card border-border/60 hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {v.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{v.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono mt-0.5">
                        <MapPin className="w-3 h-3" />{v.district}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-mono uppercase ${v.status === "active" ? "border-green-500/50 text-green-500" : "border-muted-foreground/40 text-muted-foreground"}`}>
                      {v.status}
                    </Badge>
                    {v.badge && (
                      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-mono uppercase ${badgeColor(v.badge)}`}>
                        {v.badge}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {v.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-primary/8 border border-primary/15 text-primary/80 font-mono">
                      {skill}
                    </span>
                  ))}
                  {v.skills.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground font-mono">
                      +{v.skills.length - 3}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="font-mono">{v.missionsCompleted} missions</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 text-primary/70" />
                    <span className="font-mono">{v.totalHours}h</span>
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
