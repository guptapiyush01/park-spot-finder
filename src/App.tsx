import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import SplashScreen from "./pages/SplashScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import AuthScreen from "./pages/AuthScreen";
import MapDashboard from "./pages/MapDashboard";
import SpotDetails from "./pages/SpotDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import ActiveBooking from "./pages/ActiveBooking";
import BookingHistory from "./pages/BookingHistory";
import UserProfile from "./pages/UserProfile";
import AddSpot from "./pages/AddSpot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth callback handler component
const AuthCallbackHandler = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if this is an OAuth callback (has hash with access_token or error)
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    if (error) {
      console.error('OAuth error:', error, errorDescription);
      navigate('/auth', { replace: true });
      return;
    }

    if (accessToken) {
      // OAuth callback successful, redirect to dashboard
      navigate('/dashboard', { replace: true });
      return;
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Only redirect if on auth page
        if (location.pathname === '/auth' || location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location, navigate]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthCallbackHandler>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/dashboard" element={<MapDashboard />} />
              <Route path="/spot-details" element={<SpotDetails />} />
              <Route path="/booking-confirm" element={<BookingConfirmation />} />
              <Route path="/active-booking" element={<ActiveBooking />} />
              <Route path="/history" element={<BookingHistory />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/add-spot" element={<AddSpot />} />
              <Route path="*" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthCallbackHandler>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
