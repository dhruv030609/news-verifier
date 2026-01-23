import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Analyze() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("url");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submitMutation = trpc.analysis.submit.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to analyze content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You need to be logged in to submit content for analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const contentType = activeTab === "url" ? "url" : "text";
      const content = activeTab === "url" ? urlInput : textInput;

      if (!content.trim()) {
        toast.error("Please enter content to analyze");
        setIsLoading(false);
        return;
      }

      if (contentType === "url" && !content.startsWith("http")) {
        toast.error("Please enter a valid URL");
        setIsLoading(false);
        return;
      }

      const result = await submitMutation.mutateAsync({
        contentType,
        content,
        title: title || undefined,
        sourceUrl: contentType === "url" ? content : undefined,
      });

      toast.success("Content submitted for analysis");
      
      // Redirect to results page
      setLocation(`/results/${result.submissionId}`);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="container py-8">
          <h1>Analyze Content</h1>
          <p className="text-muted-foreground mt-2">
            Submit a URL or text content to verify its credibility and detect potential misinformation.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Submit Content for Analysis</CardTitle>
              <CardDescription>
                Paste a URL or text content you want to verify
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tabs for URL/Text */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="text">Text Content</TabsTrigger>
                  </TabsList>

                  {/* URL Tab */}
                  <TabsContent value="url" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="url">Article URL</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com/article"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the full URL of the article you want to analyze
                      </p>
                    </div>
                  </TabsContent>

                  {/* Text Tab */}
                  <TabsContent value="text" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="text">Content</Label>
                      <Textarea
                        id="text"
                        placeholder="Paste the article text or social media post here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        disabled={isLoading}
                        rows={8}
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste the full text content you want to verify
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Title (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="Give this analysis a title for easy reference"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">Analysis takes 30-60 seconds</p>
                    <p>Our AI will analyze the content and provide a comprehensive credibility report.</p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Content"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Analyses */}
          <RecentAnalyses />
        </div>
      </div>
    </div>
  );
}

function RecentAnalyses() {
  const { data: analyses, isLoading } = trpc.analysis.getHistory.useQuery({
    limit: 5,
    offset: 0,
  });

  if (isLoading) {
    return null;
  }

  if (!analyses || analyses.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Recent Analyses</h2>
      <div className="space-y-3">
        {analyses.map((analysis) => (
          <Card key={analysis.id} className="card-elevated hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium line-clamp-1">
                    {Array.isArray(analysis.keyFindings) && analysis.keyFindings.length > 0 ? analysis.keyFindings[0] : "Analysis"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">
                    {analysis.credibilityScore}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {analysis.scoreCategory.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
