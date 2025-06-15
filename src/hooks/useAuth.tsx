
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

// Helper: generate a random string for a 'dummy' password (never used, but required for signUp)
function randomPassword(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|";
  let result = '';
  for (let i = 0; i < length; ++i) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ mobile: string; role?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; email?: string; mobile?: string } | null>({
    full_name: "",
    email: "",
    mobile: ""
  });
  const [loading, setLoading] = useState(false);

  // Setup user session listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({ mobile: session.user.phone || "", role: undefined });
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
        setUserProfile({
          full_name: "",
          email: "",
          mobile: ""
        });
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, mobile')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) {
        setUserProfile({
          full_name: "",
          email: "",
          mobile: user.phone || ""
        });
        setLoading(false);
        return;
      }
      setUserProfile(data);
    } catch (error) {
      setUserProfile({
        full_name: "",
        email: "",
        mobile: ""
      });
    }
    setLoading(false);
  };

  const completeProfile = async (fullName: string, email: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        // Save defaults if no user
        setUserProfile({
          full_name: "",
          email: "",
          mobile: ""
        });
        return { error: null }; // fallback to prevent block
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
      // 1. Verify OTP using Twilio-powered Supabase Edge Function
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

      // 2. After Twilio verification, check if user exists in Supabase Auth.
      // We always store with "+91" prefix for Indian numbers as Supabase expects.
      const phone = mobile.startsWith('+') ? mobile : `+91${mobile}`;

      // Check if a Supabase Auth user exists for this phone
      let getUserRes = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: false },
      });

      // If user doesn't exist yet, register/signup to Supabase Auth (which fires DB trigger)
      if (getUserRes.error && getUserRes.error.message.toLowerCase().includes('user not found')) {
        // Use random password, it's never used, phone login does not require password
        const password = randomPassword();
        await supabase.auth.signUp({
          phone,
          password,
        });

        // Now, try signInWithOtp again to get session
        getUserRes = await supabase.auth.signInWithOtp({
          phone,
          options: { shouldCreateUser: false },
        });
      }

      if (getUserRes.error) {
        setLoading(false);
        return { error: getUserRes.error.message || "Supabase user creation failed." };
      }

      // If we reach here, after Twilio-verified OTP, Supabase Auth now has the user and a session.
      setUser({ mobile: mobile, role: undefined });
      setLoading(false);
      return { error: null };
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

