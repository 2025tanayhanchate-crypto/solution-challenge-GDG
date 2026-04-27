import { useListReports } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, MapPin, Clock, Plus, CheckCircle2, AlertCircle } from "lucide-react";

export default function Reports() {
  const { data: reports, isLoading } = useListReports();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'incident': return 'border-destructive text-destructive';
      case 'needs_assessment': return 'border-accent text-accent';
      case 'impact': return 'border-secondary text-secondary';
      default: return 'border-primary text-primary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Intelligence & Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">Field reports, impact assessments, and compliance logs.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Submit Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))
        ) : (
          reports?.map((report) => (
            <Card key={report.id} className="glass-card bg-card/40 border-white/5 hover:bg-card/60 transition-colors cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-background/50 ${getTypeColor(report.type)}`}>
                    {report.type.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {report.status === 'approved' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                    ) : report.status === 'pending' ? (
                      <Clock className="w-3.5 h-3.5 text-accent" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    <span className="capitalize">{report.status}</span>
                  </div>
                </div>
                
                <h3 className="font-medium text-base mb-2 group-hover:text-primary transition-colors line-clamp-1">{report.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{report.content}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {report.district}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
