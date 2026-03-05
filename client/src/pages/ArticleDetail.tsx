import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, User, Calendar, FileText, Eye, Share2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ArticleDetailProps {
  params: {
    id: string;
  };
}

export default function ArticleDetail({ params }: ArticleDetailProps) {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const articleId = parseInt(params.id);

  const { data: article, isLoading } = trpc.articles.getArticle.useQuery(
    { articleId },
    { enabled: isAuthenticated && !isNaN(articleId) }
  );

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.content.substring(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="font-semibold mb-2">Article not found</h3>
              <Button onClick={() => navigate("/my-articles")} className="mt-4">
                Back to Articles
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/my-articles")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 max-w-3xl">
        <article className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold">{article.title}</h1>
              <Badge className={getStatusColor(article.status)}>
                {article.status.replace("_", " ")}
              </Badge>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
              )}
              {article.publicationDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(article.publicationDate), { addSuffix: true })}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.viewCount} views</span>
              </div>
              {article.category && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="capitalize">{article.category}</span>
                </div>
              )}
            </div>
          </div>

          {/* Verification Score */}
          {article.verificationScore !== null && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Verification Score</span>
                    <span className="text-2xl font-bold text-accent">{article.verificationScore}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${article.verificationScore}%` }}
                    />
                  </div>
                  {article.verificationNotes && (
                    <p className="text-sm text-muted-foreground pt-2">{article.verificationNotes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Article Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap text-base leading-relaxed">
              {article.content}
            </div>
          </div>

          {/* Source URL */}
          {article.sourceUrl && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Source</p>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline break-all"
                >
                  {article.sourceUrl}
                </a>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-6">
            {article.userId === user?.id && article.status === "draft" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/edit-article/${article.id}`)}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Implement publish functionality
                    toast.info("Publish functionality coming soon");
                  }}
                >
                  Publish for Review
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => navigate("/my-articles")}
            >
              Back to Articles
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
