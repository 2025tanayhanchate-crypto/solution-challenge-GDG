import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListNgos, useCreateNgo, getListNgosQueryKey } from "@workspace/api-client-react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Users, Target, Plus, Mail, Phone, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Ngos() {
  const { t } = useApp();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: ngos, isLoading } = useListNgos();
  const createMutation = useCreateNgo();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", registrationNumber: "", district: "",
    category: "Disaster Relief", contactEmail: "", phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: form as any }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListNgosQueryKey() });
        qc.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
        toast({ title: "NGO registered successfully" });
        setShowForm(false);
        setForm({ name: "", registrationNumber: "", district: "", category: "Disaster Relief", contactEmail: "", phone: "" });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">{t.ngoDirectory}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Verified partner organizations.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />{t.registerNgo}
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-5 relative">
          <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-display font-semibold text-lg mb-4">{t.registerNgo}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Organization {t.name} *</label>
              <Input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="NGO full name" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.regNumber} *</label>
              <Input required value={form.registrationNumber} onChange={e => setForm(f => ({...f, registrationNumber: e.target.value}))}
                placeholder="NGO-MH-2024-XXXX" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.district} *</label>
              <Input required value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))}
                placeholder="e.g. Mumbai" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.category}</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Disaster Relief","Healthcare","Education","Environment","Welfare","Women Empowerment","Child Welfare","Other"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.contactEmail} *</label>
              <Input required type="email" value={form.contactEmail} onChange={e => setForm(f => ({...f, contactEmail: e.target.value}))}
                placeholder="contact@ngo.org" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.phone}</label>
              <Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                placeholder="+91 XXXXX XXXXX" className="bg-background border-border" />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Registering..." : t.registerNgo}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t.cancel}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />) : (
          ngos?.map(ngo => (
            <Card key={ngo.id} className="glass-card border-border/60 hover:border-primary/20 transition-all">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium leading-tight truncate pr-2">{ngo.name}</h3>
                      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-mono uppercase shrink-0 ${
                        ngo.status === "active" ? "border-green-500/50 text-green-500" : "border-muted-foreground/40 text-muted-foreground"
                      }`}>
                        {ngo.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ngo.district}</span>
                      <span className="text-border">·</span>
                      <span>{ngo.registrationNumber || "N/A"}</span>
                      <span className="text-border">·</span>
                      <span className="text-primary/80">{ngo.category}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-background/60 rounded p-2 flex items-center gap-2 border border-border/50">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Volunteers</div>
                          <div className="font-mono font-medium text-sm">{ngo.activeVolunteers || 0}</div>
                        </div>
                      </div>
                      <div className="bg-background/60 rounded p-2 flex items-center gap-2 border border-border/50">
                        <Target className="w-3.5 h-3.5 text-primary/70" />
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Missions</div>
                          <div className="font-mono font-medium text-sm">{ngo.totalMissions || 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <a href={`mailto:${ngo.contactEmail}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Mail className="w-3.5 h-3.5" /> {ngo.contactEmail}
                      </a>
                      {ngo.phone && (
                        <a href={`tel:${ngo.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                      )}
                    </div>
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
