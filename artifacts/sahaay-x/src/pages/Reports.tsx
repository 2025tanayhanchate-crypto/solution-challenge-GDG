import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListReports, useCreateReport, getListReportsQueryKey } from "@workspace/api-client-react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, MapPin, Clock, Plus, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { t } = useApp();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: reports, isLoading } = useListReports();
  const createMutation = useCreateReport();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "field", district: "", content: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: form as any }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListReportsQueryKey() });
        toast({ title: "Report submitted successfully" });
        setShowForm(false);
        setForm({ title: "", type: "field", district: "", content: "" });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const getTypeColor = (type: string) => {
    if (type === "incident") return "border-red-500/50 text-red-500";
    if (type === "needs_assessment") return "border-orange-500/50 text-orange-500";
    if (type === "impact") return "border-green-500/50 text-green-500";
    return "border-primary/50 text-primary";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">{t.intelligenceReports}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Field reports, impact assessments, and compliance logs.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />{t.submitReport}
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-5 relative">
          <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-display font-semibold text-lg mb-4">{t.submitReport}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.title} *</label>
                <Input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  placeholder="Report title" className="bg-background border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.type}</label>
                <Select value={form.type} onValueChange={v => setForm(f => ({...f, type: v}))}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field">Field Report</SelectItem>
                    <SelectItem value="incident">Incident Report</SelectItem>
                    <SelectItem value="needs_assessment">Needs Assessment</SelectItem>
                    <SelectItem value="impact">Impact Report</SelectItem>
                    <SelectItem value="performance">Performance Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.district} *</label>
                <Input required value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))}
                  placeholder="e.g. Guwahati" className="bg-background border-border" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.content} *</label>
              <Textarea required value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))}
                placeholder="Detailed findings, observations, and recommendations..." rows={5}
                className="bg-background border-border resize-none" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Submitting..." : t.submitReport}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t.cancel}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />) : (
          reports?.map(report => (
            <Card key={report.id} className="glass-card border-border/60 hover:border-primary/20 transition-all cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${getTypeColor(report.type)}`}>
                    {report.type.replace("_", " ")}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {report.status === "approved" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-primary/70" />
                    )}
                    <span className="capitalize">{report.status}</span>
                  </div>
                </div>
                <h3 className="font-medium mb-2 group-hover:text-primary transition-colors line-clamp-1">{report.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{report.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-3 border-t border-border/50">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{report.district}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
