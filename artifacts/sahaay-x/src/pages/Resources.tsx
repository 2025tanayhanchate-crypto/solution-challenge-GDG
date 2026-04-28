import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListResources, useCreateResource, getListResourcesQueryKey } from "@workspace/api-client-react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, MapPin, Database, Plus, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Resources() {
  const { t } = useApp();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Medical", district: "", quantity: "100", unit: "units" });

  const { data: resources, isLoading } = useListResources();
  const createMutation = useCreateResource();

  const filtered = resources?.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.district.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    if (status === "available") return "border-green-500/50 text-green-500";
    if (status === "allocated") return "border-primary/60 text-primary";
    return "border-red-500/50 text-red-500";
  };

  const getCategoryIcon = (category: string) => {
    const colors: Record<string, string> = {
      Medical: "text-red-400", Food: "text-orange-400", Water: "text-blue-400",
      Shelter: "text-yellow-400", Equipment: "text-purple-400",
      Environmental: "text-green-400", Clothing: "text-pink-400",
    };
    return colors[category] || "text-primary";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        name: form.name,
        category: form.category,
        district: form.district,
        quantity: parseInt(form.quantity) || 0,
        unit: form.unit,
      }
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListResourcesQueryKey() });
        qc.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
        toast({ title: "Resource added successfully" });
        setShowForm(false);
        setForm({ name: "", category: "Medical", district: "", quantity: "100", unit: "units" });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const totalItems = resources?.reduce((sum, r) => sum + r.quantity, 0) || 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t.searchInventory} value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border" />
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />{t.addResource}
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-5 relative">
          <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-display font-semibold text-lg mb-4">{t.addResource}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.name} *</label>
              <Input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Resource name" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.category}</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Medical", "Food", "Water", "Shelter", "Equipment", "Environmental", "Clothing", "Other"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.district} *</label>
              <Input required value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))}
                placeholder="e.g. Mumbai" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.quantity}</label>
              <Input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))}
                className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.unit}</label>
              <Select value={form.unit} onValueChange={v => setForm(f => ({...f, unit: v}))}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["units", "kg", "liters", "packets", "pieces", "boxes", "tablets", "sachets"].map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : t.addResource}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t.cancel}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-4 text-sm text-muted-foreground font-mono">
        <span>{resources?.length || 0} items</span>
        <span className="text-primary">{totalItems.toLocaleString()} total units</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />) : (
          filtered?.map(r => (
            <Card key={r.id} className="glass-card border-border/60 hover:border-primary/25 transition-all">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-8 h-8 rounded bg-background border border-border flex items-center justify-center ${getCategoryIcon(r.category)}`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-mono uppercase ${getStatusColor(r.status)}`}>
                    {r.status}
                  </Badge>
                </div>
                <h3 className="font-medium text-sm truncate mb-0.5" title={r.name}>{r.name}</h3>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-3">{r.category}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 font-mono">
                    <Database className="w-3 h-3" />
                    <span className={`font-semibold ${r.status === "depleted" ? "text-red-500" : "text-foreground"}`}>
                      {r.quantity.toLocaleString()}
                    </span>
                    <span>{r.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3" />{r.district}
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
