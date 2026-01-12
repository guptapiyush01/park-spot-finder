import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import SplashScreen from "./pages/SplashScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import AuthScreen from "./pages/AuthScreen";
import MapDashboard from "./pages/MapDashboard";
import SpotDetails from "./pages/SpotDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import ActiveBooking from "./pages/ActiveBooking";
import BookingHistory from "./pages/BookingHistory";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
