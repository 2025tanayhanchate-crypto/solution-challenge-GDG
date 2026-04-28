import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useAnalyzeCommunitySurvey, useMatchVolunteers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, FileSpreadsheet, Users, BrainCircuit, Loader2, Sparkles, MapPin, Target, AlertCircle } from "lucide-react";

export default function Assistant() {
  const { t } = useApp();
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
        requiredSkills: missionSkills.split(",").map(s => s.trim()).filter(Boolean) as any,
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold">{t.aiIntelligence}</h2>
          <p className="text-sm text-muted-foreground">Powered by Claude and Gemini. AI calls are made only on submit.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Match Engine */}
        <Card className="glass-card border-border/50 flex flex-col">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {t.matchEngine}
              <Badge variant="outline" className="ml-auto text-[10px] font-mono border-primary/30 text-primary/70">Claude</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col gap-3">
            <Textarea
              placeholder="Describe the mission requirements and context..."
              className="bg-background border-border resize-none"
              value={missionDesc}
              onChange={e => setMissionDesc(e.target.value)}
              rows={4}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder={t.district} className="pl-9 bg-background border-border"
                  value={missionDistrict} onChange={e => setMissionDistrict(e.target.value)} />
              </div>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Skills needed" className="pl-9 bg-background border-border"
                  value={missionSkills} onChange={e => setMissionSkills(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleMatch} className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={matchMutation.isPending || !missionDesc || !missionDistrict}>
              {matchMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Matching...</> : <><BrainCircuit className="w-4 h-4 mr-2" />{t.findMatches}</>}
            </Button>

            {matchMutation.isError && (
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/8 rounded p-3 border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                AI matching failed. Please try again.
              </div>
            )}

            {matchMutation.data && (
              <div className="space-y-2 bg-background/60 rounded-lg p-4 border border-border/50">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />Top Matches
                </h4>
                {(matchMutation.data as any).matches?.map((m: any, i: number) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded bg-background border border-border/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{m.volunteerName}</span>
                        <Badge variant="outline" className="font-mono text-[10px] border-primary/40 text-primary shrink-0">
                          {m.matchScore}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{m.reasoning}</p>
                    </div>
                  </div>
                ))}
                {(matchMutation.data as any).summary && (
                  <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">{(matchMutation.data as any).summary}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Survey Analyzer */}
        <Card className="glass-card border-border/50 flex flex-col">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              {t.surveyAnalyzer}
              <Badge variant="outline" className="ml-auto text-[10px] font-mono border-primary/30 text-primary/70">Gemini</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col gap-3">
            <Textarea
              placeholder={"Paste CSV survey data here...\n\nExample:\nRespondent,District,Need,Severity\n1,Guwahati,Clean Water,9\n2,Delhi,Food,7"}
              className="bg-background border-border flex-1 min-h-[140px] font-mono text-xs resize-none"
              value={csvData}
              onChange={e => setCsvData(e.target.value)}
            />
            <Button onClick={handleAnalyze} className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={analyzeMutation.isPending || !csvData}>
              {analyzeMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><BrainCircuit className="w-4 h-4 mr-2" />{t.analyzeData}</>}
            </Button>

            {analyzeMutation.isError && (
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/8 rounded p-3 border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Analysis failed. Please try again.
              </div>
            )}

            {analyzeMutation.data && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Risk Level</span>
                  <Badge variant="outline" className={`font-mono uppercase ${
                    (analyzeMutation.data as any).overall_risk_level === "HIGH" || (analyzeMutation.data as any).overall_risk_level === "CRITICAL"
                      ? "border-red-500/50 text-red-500" : "border-primary/50 text-primary"
                  }`}>
                    {(analyzeMutation.data as any).overall_risk_level}
                  </Badge>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Top Needs</span>
                  <div className="space-y-1.5">
                    {(analyzeMutation.data as any).top5_needs?.map((need: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-background/60 p-2.5 rounded border border-border/50">
                        <span className="font-medium text-xs">{need.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(need.severity / 10) * 100}%` }} />
                          </div>
                          <span className="text-[10px] font-mono">{need.severity}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {(analyzeMutation.data as any).key_insights && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Key Insights</span>
                    <ul className="space-y-1">
                      {(analyzeMutation.data as any).key_insights.map((insight: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-primary mt-0.5">·</span>{insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
