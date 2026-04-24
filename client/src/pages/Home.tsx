import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { CheckCircle2, Search, BarChart3, Shield, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold">NewsVerifier</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/analyze">
                  <Button variant="outline">Analyze Content</Button>
                </Link>
                <Link href="/verify-image">
                  <Button variant="outline">Verify Image</Button>
                </Link>
                <Link href="/my-articles">
                  <Button variant="outline">My Articles</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <a href={getLoginUrl()}>
                  <Button>Sign In</Button>
                </a>
                {/* Mock login for local development */}
                {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                  <a href="/api/mock-login">
                    <Button variant="outline" size="sm">Dev Login</Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 border-b border-border">
        <div className="container max-w-4xl">
          <div className="space-y-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-balance">
              Verify Content with Confidence
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced AI-powered analysis to detect misinformation, assess credibility, and understand the trustworthiness of online content in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Link href="/analyze">
                  <Button size="lg" className="gap-2">
                    Start Analyzing <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="gap-2">
                      Get Started Free <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                  {/* Mock login for local development */}
                  {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                    <a href="/api/mock-login">
                      <Button size="lg" variant="outline" className="gap-2">
                        Dev Login <ArrowRight className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              )}
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 border-b border-border">
        <div className="container">
          <div className="space-y-4 text-center mb-16">
            <h2>Powerful Analysis Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive credibility assessment powered by advanced AI and fact-checking databases
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="card-elevated">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Content Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Analyze headlines, body content, evidence quality, and detect red flags with AI-powered precision.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="card-elevated">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Credibility Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get a 0-100 credibility score with detailed breakdown of source reputation and verification status.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="card-elevated">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Cross-Reference Check</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Verify claims against fact-checking databases and established news agencies in real-time.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-center mb-16">How It Works</h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Submit Content</h3>
                <p className="text-muted-foreground">
                  Paste a URL or submit text content you want to verify. Our system accepts articles, social media posts, and more.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our advanced AI analyzes source credibility, content quality, evidence citations, and detects potential misinformation markers.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get Results</h3>
                <p className="text-muted-foreground">
                  Receive a comprehensive credibility report with scoring, key findings, source assessment, and actionable recommendations.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Save & Share</h3>
                <p className="text-muted-foreground">
                  Bookmark important analyses and access your history anytime. Share findings with others to promote media literacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Framework Section */}
      <section className="py-20 md:py-32 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-center mb-16">Comprehensive Analysis Framework</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Source Credibility */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Source Credibility</h4>
                  <p className="text-sm text-muted-foreground">Publisher reputation, domain history, and fact-checking records</p>
                </div>
              </div>
            </div>

            {/* Content Analysis */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Content Analysis</h4>
                  <p className="text-sm text-muted-foreground">Headline sensationalism, body consistency, and evidence quality</p>
                </div>
              </div>
            </div>

            {/* Visual Verification */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Visual Verification</h4>
                  <p className="text-sm text-muted-foreground">Image manipulation detection and deepfake identification</p>
                </div>
              </div>
            </div>

            {/* Cross-Reference */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Cross-Reference Verification</h4>
                  <p className="text-sm text-muted-foreground">Fact-checking database matching and news agency corroboration</p>
                </div>
              </div>
            </div>

            {/* Red Flag Detection */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Red Flag Detection</h4>
                  <p className="text-sm text-muted-foreground">Conspiracy markers, suspicious timestamps, and misinformation patterns</p>
                </div>
              </div>
            </div>

            {/* Bias Assessment */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Bias Assessment</h4>
                  <p className="text-sm text-muted-foreground">Political leaning, journalistic standards, and potential bias indicators</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container max-w-3xl text-center space-y-8">
          <h2>Ready to Verify Content?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of users making informed decisions with AI-powered credibility analysis.
          </p>
          {isAuthenticated ? (
            <Link href="/analyze">
              <Button size="lg" className="gap-2">
                Start Analyzing <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2">
                Sign Up Free <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>NewsVerifier © 2026. Empowering media literacy through AI-powered verification.</p>
        </div>
      </footer>
    </div>
  );
}
