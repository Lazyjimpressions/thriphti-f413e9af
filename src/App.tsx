
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NavigationBar from "@/components/layout/NavigationBar";
import Index from "./pages/Index";
import Stores from "./pages/Stores";
import StoreDetail from "./pages/StoreDetail";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import ThisWeekend from "./pages/ThisWeekend";
import EventDetail from "./pages/EventDetail";
import Guides from "./pages/Guides";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen relative">
            <NavigationBar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/stores/:storeId" element={<StoreDetail />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/this-weekend" element={<ThisWeekend />} />
              <Route path="/events/:eventId" element={<EventDetail />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
