import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, BarChart3, FileText, Bookmark, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Please sign in to view your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStatistics.useQuery();
  const { data: history, isLoading: historyLoading } = trpc.dashboard.getAnalysisHistory.useQuery();
  const [, setLocation] = useLocation();

  if (statsLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 86) return "score-high";
    if (score >= 61) return "score-medium";
    return "score-low";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 86) return "Highly Credible";
    if (score >= 61) return "Likely Credible";
    if (score >= 31) return "Questionable";
    return "High Risk";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-muted/30">
        <div className="container py-8">
          <h1>Your Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track your analysis history and insights</p>
        </div>
      </div>

      <div className="container py-12">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Total Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats?.totalAnalyses || 0}</p>
              <p className="text-sm text-muted-foreground mt-2">Content pieces analyzed</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-4xl font-bold ${getScoreColor(stats?.averageScore || 0)}`}>
                {stats?.averageScore || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{getScoreLabel(stats?.averageScore || 0)}</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-accent" />
                Saved Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats?.savedCount || 0}</p>
              <p className="text-sm text-muted-foreground mt-2">Bookmarked analyses</p>
            </CardContent>
          </Card>
        </div>

        {/* Analysis History */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              Recent Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history && history.length > 0 ? (
              <div className="space-y-4">
                {history.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/results/${analysis.id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">Analysis #{analysis.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(analysis.credibilityScore)}`}>
                          {analysis.credibilityScore}
                        </p>
                        <p className="text-xs text-muted-foreground">{getScoreLabel(analysis.credibilityScore)}</p>
                      </div>
                      {analysis.isSaved && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Bookmark className="w-3 h-3" />
                          Saved
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No analyses yet</p>
                <Button onClick={() => window.location.href = "/analyze"}>
                  Start Your First Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
