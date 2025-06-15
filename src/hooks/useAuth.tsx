
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: { mobile: string; role?: string } | null;
  loading: boolean;
  sendOtp: (mobile: string) => Promise<{ error: any }>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userProfile?: { full_name?: string; email?: string; mobile?: string } | null;
  completeProfile?: (fullName: string, email: string) => Promise<{ error: any }>;
  fetchProfile?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get Edge Function URL
const SUPABASE_FUNCTIONS_BASE = "https://llvujxdmzuyebkzuutqn.functions.supabase.co";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ mobile: string; role?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; email?: string; mobile?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Setup user session listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({ mobile: session.user.phone || "", role: undefined });

        // fetch user profile non-blocking
        setTimeout(() => {
          fetchProfile();
        }, 0);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ mobile: session.user.phone || "", role: undefined });
        fetchProfile();
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, mobile')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch user profile", error);
        setUserProfile(null);
        setLoading(false);
        return;
      }
      setUserProfile(data);
    } catch (error) {
      setUserProfile(null);
    }
    setLoading(false);
  };

  const completeProfile = async (fullName: string, email: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return { error: "User not authenticated." };
      }
      // update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          email: email
        })
        .eq('id', user.id);

      if (error) {
        setLoading(false);
        return { error: error.message || "Failed to update profile." };
      }
      // Refetch the updated profile
      await fetchProfile();
      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error: "Failed to update profile." };
    }
  };

  const sendOtp = async (mobile: string) => {
    setLoading(true);
    try {
      // Use Twilio-powered edge function instead of Supabase auth
      const response = await fetch(
        `${SUPABASE_FUNCTIONS_BASE}/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ mobile })
        }
      );
      const data = await response.json();
      setLoading(false);
      if (!response.ok) {
        console.error("OTP send failed:", data.error);
        return { error: data.error || "Failed to send OTP. Please try again." };
      }
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      console.error("OTP send failed:", error);
      return { error: "Failed to send OTP. Please try again." };
    }
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    setLoading(true);
    try {
      // Verify OTP using Twilio-powered Supabase Edge Function
      const response = await fetch(
        `${SUPABASE_FUNCTIONS_BASE}/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ mobile, otp })
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        setLoading(false);
        const errMsg = data?.error || "Verification failed. Please check your details and try again.";
        console.error("Twilio OTP verification failed", errMsg);
        return { error: errMsg };
      }

      // Now, sign in (or sign up if user does not exist) via Supabase using signInWithOtp (but skip its OTP, because it's verified via Twilio)
      // We'll use signInWithOtp with "options: { shouldCreateUser: true }" (Supabase will just set the session w/o sending OTP again)
      const { data: result, error } = await supabase.auth.signInWithOtp({
        phone: mobile.startsWith('+') ? mobile : `+91${mobile}`,
        token: otp,
        type: 'sms',
        options: {
          shouldCreateUser: true
        }
      });

      setLoading(false);

      if (error) {
        console.error("Supabase session creation error:", error.message);
        return { error: "Login failed after OTP verification. Please try again." };
      } else if (result?.user) {
        setUser({ mobile: result.user.phone || "", role: undefined });
        return { error: null };
      }
      return { error: "Login failed after OTP verification." };
    } catch (error: any) {
      setLoading(false);
      console.error("verifyOtp error:", error);
      return { error: "Verification failed. Please check your details and try again." };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      sendOtp,
      verifyOtp,
      signOut,
      userProfile,
      completeProfile,
      fetchProfile, // expose this as well for manual refresh
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext) as AuthContextType & {
    userProfile?: { full_name?: string; email?: string; mobile?: string } | null;
    completeProfile?: (fullName: string, email: string) => Promise<{ error: any }>;
    fetchProfile?: () => Promise<void>;
  };
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
