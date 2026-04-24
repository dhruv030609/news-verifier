import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, AlertCircle, CheckCircle, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface AnalysisResult {
  extractedText: string | null;
  imageDescription: string | null;
  manipulationScore: number | null;
  deepfakeScore: number | null;
  authenticityScore: number | null;
  newsCredibilityScore: number | null;
  newsCategory: string | null;
  redFlags: string[] | any;
  keyFindings: string[] | any;
  recommendations: string[] | any;
}

export default function VerifyImage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [imageUrl, setImageUrl] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [verificationId, setVerificationId] = useState<number | null>(null);

  const analyzeMutation = trpc.imageVerification.analyze.useMutation({
    onSuccess: (data) => {
      setIsAnalyzing(false);
      if (data.verification) {
        setVerificationId(data.verification.id);
        setResult({
          extractedText: data.verification.extractedText || "",
          imageDescription: data.verification.imageDescription || "",
          manipulationScore: data.verification.manipulationScore || 0,
          deepfakeScore: data.verification.deepfakeScore || 0,
          authenticityScore: data.verification.authenticityScore || 50,
          newsCredibilityScore: data.verification.newsCredibilityScore || 0,
          newsCategory: data.verification.newsCategory || "other",
          redFlags: (data.verification.redFlags as string[]) || [],
          keyFindings: (data.verification.keyFindings as string[]) || [],
          recommendations: (data.verification.recommendations as string[]) || [],
        });
        toast.success("Image analysis complete!");
      }
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  const handleAnalyze = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    analyzeMutation.mutate({
      imageUrl: imageUrl.trim(),
      imageDescription: imageDescription.trim() || undefined,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-blue-50";
    if (score >= 40) return "bg-yellow-50";
    return "bg-red-50";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Please log in to verify images.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Image News Verification</h1>
          <p className="text-gray-600">Upload or paste an image URL to analyze the news content and detect manipulation</p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Provide Image URL
            </CardTitle>
            <CardDescription>Enter the URL of the image you want to verify</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isAnalyzing}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Description (Optional)
              </label>
              <Textarea
                placeholder="Add context about the image (e.g., where it's from, what it claims to show)"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                disabled={isAnalyzing}
                className="w-full"
                rows={3}
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !imageUrl.trim()}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Analyze Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Image Preview */}
        {imageUrl && !isAnalyzing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Image Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full max-h-96 rounded-lg mx-auto"
                onError={() => toast.error("Failed to load image")}
              />
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Credibility Score */}
              <Card className={getScoreBgColor(result.newsCredibilityScore ?? 0)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className={`w-6 h-6 ${getScoreColor(result.newsCredibilityScore ?? 0)}`} />
                    News Credibility Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold" style={{ color: getScoreColor(result.newsCredibilityScore ?? 0).replace("text-", "") }}>
                      {result.newsCredibilityScore ?? 0}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            (result.newsCredibilityScore ?? 0) >= 80
                              ? "bg-green-600"
                              : (result.newsCredibilityScore ?? 0) >= 60
                              ? "bg-blue-600"
                              : (result.newsCredibilityScore ?? 0) >= 40
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${result.newsCredibilityScore ?? 0}%` }}
                      />
                    </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {(result.newsCredibilityScore ?? 0) >= 80
                          ? "Highly Credible"
                          : (result.newsCredibilityScore ?? 0) >= 60
                          ? "Likely Credible"
                          : (result.newsCredibilityScore ?? 0) >= 40
                          ? "Questionable"
                          : "High Misinformation Risk"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* Image Analysis Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manipulation Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{result.manipulationScore ?? 0}%</div>
                  <p className="text-sm text-gray-600 mt-2">
                    {(result.manipulationScore ?? 0) > 70
                      ? "Likely manipulated"
                      : (result.manipulationScore ?? 0) > 40
                      ? "Possible editing"
                      : "Appears authentic"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deepfake Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{result.deepfakeScore ?? 0}%</div>
                  <p className="text-sm text-gray-600 mt-2">
                    {(result.deepfakeScore ?? 0) > 70
                      ? "Likely deepfake"
                      : (result.deepfakeScore ?? 0) > 40
                      ? "Possible AI-generated"
                      : "Appears genuine"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Authenticity Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{result.authenticityScore ?? 50}%</div>
                  <p className="text-sm text-gray-600 mt-2">
                    {(result.authenticityScore ?? 50) > 70
                      ? "Highly authentic"
                      : (result.authenticityScore ?? 50) > 40
                      ? "Somewhat authentic"
                      : "Questionable authenticity"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Extracted Text */}
            {result.extractedText && result.extractedText !== "NO_TEXT_FOUND" && (
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{result.extractedText}</p>
                </CardContent>
              </Card>
            )}

            {/* Red Flags */}
            {result.redFlags.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    Red Flags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.redFlags.map((flag: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-red-700">
                        <span className="text-red-600 font-bold mt-1">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Key Findings */}
            {result.keyFindings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.keyFindings.map((finding: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-700">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-blue-700">
                        <TrendingDown className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setImageUrl("");
                  setImageDescription("");
                  setResult(null);
                  setVerificationId(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Analyze Another Image
              </Button>
              {verificationId && (
                <Button
                  onClick={() => setLocation(`/image-results/${verificationId}`)}
                  className="flex-1"
                >
                  View Full Report
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
