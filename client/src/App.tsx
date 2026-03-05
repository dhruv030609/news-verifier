import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";
import ImageVerification from "./pages/ImageVerification";
import SubmitArticle from "./pages/SubmitArticle";
import MyArticles from "./pages/MyArticles";
import ArticleDetail from "./pages/ArticleDetail";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/analyze"} component={Analyze} />
      <Route path={"/results/:id"} component={Results} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/verify-image/:id"} component={ImageVerification} />
      <Route path={"/submit-article"} component={SubmitArticle} />
      <Route path={"/my-articles"} component={MyArticles} />
      <Route path={"/article/:id"} component={ArticleDetail} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
