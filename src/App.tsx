import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import SignupPage from "@/components/SignupPage";
import PhoneVerificationPage from "@/components/PhoneVerificationPage";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  // Use the new enhanced auth hook
  const { user, session, loading, isEmailConfirmed, isPhoneVerified, refreshUser } = useEnhancedAuth();

  // Loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Not logged in: show signup/login page
  if (!user) {
    return <SignupPage onSignupSuccess={refreshUser} />;
  }

  // Email not confirmed: prompt to check email
  if (!isEmailConfirmed) {
    return (
      <SignupPage onSignupSuccess={refreshUser} />
    );
  }

  // Phone not set/verified: must add/verify to pass
  if (!isPhoneVerified) {
    return <PhoneVerificationPage user={user} onPhoneVerified={refreshUser} />;
  }

  // Fully authenticated & verified: show app
  return (
    
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
