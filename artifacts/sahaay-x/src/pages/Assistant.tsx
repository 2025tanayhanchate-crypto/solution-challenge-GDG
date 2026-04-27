import { useState } from "react";
import { useAnalyzeCommunitySurvey, useMatchVolunteers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, FileSpreadsheet, Users, BrainCircuit, Loader2, Sparkles, MapPin, Target } from "lucide-react";

export default function Assistant() {
  const [csvData, setCsvData] = useState("");
  const [missionDesc, setMissionDesc] = useState("");
  const [missionDistrict, setMissionDistrict] = useState("");
  const [missionSkills, setMissionSkills] = useState("");
  
  const analyzeMutation = useAnalyzeCommunitySurvey();
  const matchMutation = useMatchVolunteers();

  const handleAnalyze = () => {
    if (!csvData.trim()) return;
    analyzeMutation.mutate({ data: { csvData } });
  };

  const handleMatch = () => {
    if (!missionDesc.trim() || !missionDistrict.trim()) return;
    matchMutation.mutate({ 
      data: { 
        missionDescription: missionDesc, 
        district: missionDistrict, 
        requiredSkills: missionSkills.split(',').map(s => s.trim()).filter(Boolean) 
      } 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-[#00B4D8] shadow-lg shadow-primary/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">AI Intelligence Hub</h2>
          <p className="text-sm text-muted-foreground">Powered by Claude and Gemini for advanced mission coordination.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Engine */}
        <Card className="glass-card bg-card/40 border-white/5 flex flex-col">
          <CardHeader className="border-b border-white/5 bg-background/20">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Volunteer Match Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col gap-4">
            <div className="space-y-3">
              <Textarea 
                placeholder="Describe the mission requirements and context..."
                className="bg-background/50 border-white/10 min-h-[100px] resize-none"
                value={missionDesc}
                onChange={(e) => setMissionDesc(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="District" 
                    className="pl-9 bg-background/50 border-white/10" 
                    value={missionDistrict}
                    onChange={(e) => setMissionDistrict(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Required Skills (comma separated)" 
                    className="pl-9 bg-background/50 border-white/10" 
                    value={missionSkills}
                    onChange={(e) => setMissionSkills(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              onClick={handleMatch}
              disabled={matchMutation.isPending || !missionDesc || !missionDistrict}
            >
              {matchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
              Find Best Matches
            </Button>

            {matchMutation.data && (
              <div className="mt-4 space-y-3 bg-background/30 rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Top Candidates
                </h4>
                <div className="space-y-2">
                  {matchMutation.data.matches.map((match, i) => (
                    <div key={i} className="flex flex-col gap-1 p-2 rounded bg-background/50 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{match.volunteerName}</span>
                        <Badge variant="outline" className="font-mono text-[10px] border-secondary text-secondary bg-secondary/10">
                          {match.matchScore}% Match
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{match.reasoning}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t border-white/5">{matchMutation.data.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Survey Analyzer */}
        <Card className="glass-card bg-card/40 border-white/5 flex flex-col">
          <CardHeader className="border-b border-white/5 bg-background/20">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-accent" />
              Community Survey Analyzer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col gap-4">
            <Textarea 
              placeholder="Paste CSV survey data here (e.g., Respondent, District, Reported Need, Severity)..."
              className="bg-background/50 border-white/10 flex-1 min-h-[150px] font-mono text-xs"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
            />
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-white" 
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || !csvData}
            >
              {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
              Analyze Data
            </Button>

            {analyzeMutation.data && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Risk Level</span>
                  <Badge variant="outline" className={`font-mono uppercase ${
                    analyzeMutation.data.overall_risk_level === 'HIGH' || analyzeMutation.data.overall_risk_level === 'CRITICAL' ? 'border-destructive text-destructive' : 'border-chart-4 text-chart-4'
                  }`}>
                    {analyzeMutation.data.overall_risk_level}
                  </Badge>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Top Needs Identified</span>
                  <div className="space-y-2">
                    {analyzeMutation.data.top5_needs.map((need, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-background/50 p-2 rounded border border-white/5">
                        <span className="font-medium">{need.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-destructive" style={{ width: `${(need.severity / 10) * 100}%` }} />
                          </div>
                          <span className="text-xs font-mono">{need.severity}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
