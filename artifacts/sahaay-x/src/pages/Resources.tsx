import { useState } from "react";
import { useListResources } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, MapPin, Database, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Resources() {
  const [search, setSearch] = useState("");
  const { data: resources, isLoading } = useListResources();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'border-secondary text-secondary';
      case 'allocated': return 'border-primary text-primary';
      case 'depleted': return 'border-destructive text-destructive';
      default: return 'border-muted text-muted-foreground';
    }
  };

  const filteredResources = resources?.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.district.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search inventory..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/40 border-white/10 glass-card"
          />
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))
        ) : (
          filteredResources?.map((resource) => (
            <Card key={resource.id} className="glass-card bg-card/40 border-white/5 hover:bg-card/60 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${getStatusColor(resource.status)}`}>
                    {resource.status}
                  </Badge>
                </div>
                
                <h3 className="font-medium text-sm mb-1 truncate" title={resource.name}>{resource.name}</h3>
                
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 font-mono">
                    <Database className="w-3.5 h-3.5" />
                    <span className={resource.status === 'depleted' ? 'text-destructive font-bold' : 'text-foreground font-medium'}>
                      {resource.quantity.toLocaleString()}
                    </span> {resource.unit}
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5" /> {resource.district}
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
