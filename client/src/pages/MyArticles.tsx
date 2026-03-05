import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Plus, FileText, Eye, Calendar, User, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MyArticles() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: articles, isLoading } = trpc.articles.getUserArticles.useQuery(
    { limit: 50, offset: 0 },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your articles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">My Articles</h1>
          <Button onClick={() => navigate("/submit-article")} className="gap-2">
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/article/${article.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Title and Status */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate">{article.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {article.content.substring(0, 150)}...
                        </p>
                      </div>
                      <Badge className={getStatusColor(article.status)}>
                        {article.status.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {article.author && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {article.author}
                        </div>
                      )}
                      {article.publicationDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(article.publicationDate), { addSuffix: true })}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.viewCount} views
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {article.category}
                      </div>
                    </div>

                    {/* Verification Score */}
                    {article.verificationScore !== null && (
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Verification Score</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent transition-all"
                                style={{ width: `${article.verificationScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{article.verificationScore}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/article/${article.id}`);
                        }}
                      >
                        View
                      </Button>
                      {article.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/edit-article/${article.id}`);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      {article.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement publish functionality
                          }}
                        >
                          Publish for Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
              <div>
                <h3 className="font-semibold mb-2">No articles yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by submitting your first article for verification
                </p>
                <Button onClick={() => navigate("/submit-article")} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Submit Article
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
