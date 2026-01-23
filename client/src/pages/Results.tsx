import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle, Share2, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Results() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const analysisId = params?.id ? parseInt(params.id, 10) : null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Please sign in to view analysis results.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysisId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Analysis Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The analysis you're looking for doesn't exist.</p>
            <Button className="mt-4 w-full" onClick={() => setLocation("/analyze")}>
              Back to Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AnalysisContent analysisId={analysisId} />;
}

function AnalysisContent({ analysisId }: { analysisId: number }) {
  const { data: analysis, isLoading } = trpc.analysis.getResult.useQuery({ analysisId });
  const saveMutation = trpc.analysis.save.useMutation();
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
          <p className="text-muted-foreground">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Analysis Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync({ analysisId });
      toast.success("Analysis saved to your library");
    } catch (error) {
      toast.error("Failed to save analysis");
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 86) return "score-high";
    if (score >= 61) return "score-medium";
    return "score-low";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 86) return "Highly Credible";
    if (score >= 61) return "Likely Credible";
    if (score >= 31) return "Questionable";
    return "High Misinformation Risk";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-muted/30">
        <div className="container py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1>Analysis Results</h1>
              <p className="text-muted-foreground mt-2">
                {new Date(analysis.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || analysis.isSaved}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {analysis.isSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-elevated border-2">
              <CardHeader>
                <CardTitle>Credibility Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Overall Credibility Score</p>
                    <p className={`text-5xl font-bold ${getScoreColor(analysis.credibilityScore)}`}>
                      {analysis.credibilityScore}
                    </p>
                    <p className="text-lg font-medium mt-2">{getScoreLabel(analysis.credibilityScore)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(analysis.keyFindings && Array.isArray(analysis.keyFindings) && (analysis.keyFindings as string[]).length > 0) ? (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-accent" />
                    Key Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(analysis.keyFindings as string[]).map((finding: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {(analysis.redFlags && Array.isArray(analysis.redFlags) && (analysis.redFlags as string[]).length > 0) ? (
              <Card className="card-elevated border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    Red Flags Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(analysis.redFlags as string[]).map((flag: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg">Source Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Publisher Reputation</p>
                  <Badge variant="outline" className="capitalize">
                    {analysis.publisherReputation}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Journalistic Standards</p>
                  <Badge variant="outline" className="capitalize">
                    {analysis.journalisticStandards.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg">Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Confirmed by Credible Sources</p>
                  <Badge variant="outline" className="capitalize">
                    {analysis.confirmedByCredibleSources}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
