import { useListNgos } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, Users, Target, Plus, Mail, Phone } from "lucide-react";

export default function Ngos() {
  const { data: ngos, isLoading } = useListNgos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">NGO Directory</h2>
          <p className="text-sm text-muted-foreground mt-1">Verified partner organizations and their operational metrics.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Register NGO
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))
        ) : (
          ngos?.map((ngo) => (
            <Card key={ngo.id} className="glass-card bg-card/40 border-white/5">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-background border border-white/10 flex items-center justify-center flex-shrink-0 text-muted-foreground">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg leading-tight truncate pr-2">{ngo.name}</h3>
                      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-mono uppercase shrink-0 ${
                        ngo.status === 'active' ? 'border-secondary text-secondary' : 'border-muted text-muted-foreground'
                      }`}>
                        {ngo.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ngo.district}</span>
                      <span className="text-border">•</span>
                      <span>Reg: {ngo.registrationNumber || 'N/A'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-background/50 rounded p-2 flex items-center gap-2 border border-white/5">
                        <Users className="w-4 h-4 text-primary" />
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Volunteers</div>
                          <div className="font-mono font-medium text-sm leading-none">{ngo.activeVolunteers || 0}</div>
                        </div>
                      </div>
                      <div className="bg-background/50 rounded p-2 flex items-center gap-2 border border-white/5">
                        <Target className="w-4 h-4 text-accent" />
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Missions</div>
                          <div className="font-mono font-medium text-sm leading-none">{ngo.totalMissions || 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                      <a href={`mailto:${ngo.contactEmail}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                        <Mail className="w-3.5 h-3.5" /> Contact Email
                      </a>
                      {ngo.phone && (
                        <a href={`tel:${ngo.phone}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
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
