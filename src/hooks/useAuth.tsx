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
      // Send OTP natively with Supabase
      const { error } = await supabase.auth.signInWithOtp({
        phone: mobile.startsWith('+') ? mobile : `+91${mobile}`,
      });
      setLoading(false);
      if (error) {
        console.error("OTP send failed:", error.message);
        return { error: "Failed to send OTP. Please try again." };
      }
      return { error: null };
    } catch (error) {
      setLoading(false);
      console.error("OTP send failed:", error);
      return { error: "Failed to send OTP. Please try again." };
    }
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    setLoading(true);
    try {
      // Verify OTP and log in to Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        phone: mobile.startsWith('+') ? mobile : `+91${mobile}`,
        token: otp,
        type: 'sms'
      });
      setLoading(false);

      if (error) {
        // Log actual error; return generic message to user
        console.error("OTP verification error:", error.message);
        return { error: "Verification failed. Please check your details and try again." };
      } else if (data?.user) {
        setUser({ mobile: data.user.phone || "" });
        return { error: null };
      }
      return { error: "Verification failed. Please check your details and try again." };
    } catch (error) {
      setLoading(false);
      console.error("OTP verification error:", error);
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
