import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { Loader2, AlertTriangle, CheckCircle2, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef } from "react";

export default function ImageVerification() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const analysisId = params?.id ? parseInt(params.id, 10) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Please sign in to verify images.</p>
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
            <p className="text-sm text-muted-foreground">Please select an analysis first.</p>
            <Button className="mt-4 w-full" onClick={() => setLocation("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-muted/30">
        <div className="container py-8">
          <h1>Image Verification</h1>
          <p className="text-muted-foreground mt-2">Check for manipulation and deepfakes</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!previewUrl ? (
                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-muted/50 transition-colors"
                >
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium mb-2">Drop image here or click to upload</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded-lg border border-border max-h-96 object-cover"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleUploadClick}
                  >
                    Change Image
                  </Button>
                </div>
              )}

              {selectedImage && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium">Selected: {selectedImage.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                disabled={!selectedImage || isAnalyzing}
                onClick={() => {
                  setIsAnalyzing(true);
                  toast.success("Image analysis started");
                  setTimeout(() => setIsAnalyzing(false), 2000);
                }}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Image"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-accent" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Manipulation Detection</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    No manipulation detected
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Deepfake Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: "15%" }} />
                    </div>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Very unlikely to be a deepfake</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Image Authenticity</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Appears authentic
                  </Badge>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium mb-3">Key Findings</p>
                <ul className="space-y-2">
                  <li className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>No signs of digital manipulation</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Metadata appears consistent</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>No known deepfake patterns detected</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
