import { useState } from "react";
import { useListVolunteers, useCreateVolunteer } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, MapPin, Clock, Award, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Volunteers() {
  const [search, setSearch] = useState("");
  const { data: volunteers, isLoading } = useListVolunteers();
  const [isOpen, setIsOpen] = useState(false);

  const filteredVolunteers = volunteers?.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.district.toLowerCase().includes(search.toLowerCase()) ||
    v.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, district, or skill..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/40 border-white/10 glass-card"
          />
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Register Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Register New Volunteer</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 pt-4" onSubmit={e => { e.preventDefault(); setIsOpen(false); }}>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-muted-foreground mb-2">Personal Information</legend>
                <Input placeholder="Full Name" className="bg-background/50 border-white/10" required />
                <Input type="email" placeholder="Email Address" className="bg-background/50 border-white/10" required />
                <Input placeholder="Phone Number" className="bg-background/50 border-white/10" required />
              </fieldset>
              <fieldset className="space-y-3 pt-2">
                <legend className="text-sm font-medium text-muted-foreground mb-2">Deployment Details</legend>
                <Input placeholder="District" className="bg-background/50 border-white/10" required />
                <Input placeholder="Skills (comma separated)" className="bg-background/50 border-white/10" required />
              </fieldset>
              <Button type="submit" className="w-full mt-4">Register</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))
        ) : (
          filteredVolunteers?.map((volunteer) => (
            <Card key={volunteer.id} className="glass-card bg-card/40 border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {volunteer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{volunteer.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {volunteer.district}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                    volunteer.status === 'active' ? 'border-secondary text-secondary' :
                    volunteer.status === 'deployed' ? 'border-primary text-primary' :
                    'border-muted text-muted-foreground'
                  }`}>
                    {volunteer.status}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {volunteer.skills.slice(0,3).map((skill, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded bg-muted/50 border border-white/5 text-muted-foreground font-mono">
                      {skill}
                    </span>
                  ))}
                  {volunteer.skills.length > 3 && (
                    <span className="text-[10px] px-2 py-1 rounded bg-muted/50 border border-white/5 text-muted-foreground font-mono">
                      +{volunteer.skills.length - 3}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono">{volunteer.missionsCompleted} Missions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span className="font-mono">{volunteer.totalHours} Hours</span>
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
