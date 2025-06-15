// --- Internal Helpers: keep outside component for clarity & testability ---
function randomPassword(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|";
  let result = '';
  for (let i = 0; i < length; ++i) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";

// --- Types ---
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

const SUPABASE_FUNCTIONS_BASE = "https://llvujxdmzuyebkzuutqn.functions.supabase.co";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // --- State hooks ---
  const [user, setUser] = useState<{ mobile: string; role?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; email?: string; mobile?: string } | null>({
    full_name: "",
    email: "",
    mobile: ""
  });
  const [loading, setLoading] = useState(false);

  // --- Fetch user profile from Supabase users/profiles ---
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserProfile({ full_name: "", email: "", mobile: "" });
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, mobile')
        .eq('id', user.id)
        .maybeSingle();

      setUserProfile(
        error || !data
          ? { full_name: "", email: "", mobile: user.phone || "" }
          : data
      );
    } catch {
      setUserProfile({ full_name: "", email: "", mobile: "" });
    }
    setLoading(false);
  };

  // --- Save profile info in Supabase profiles table ---
  const completeProfile = async (fullName: string, email: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserProfile({ full_name: "", email: "", mobile: "" });
        setLoading(false);
        return { error: null };
      }
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, email })
        .eq('id', user.id);

      if (error) {
        setLoading(false);
        return { error: error.message || "Failed to update profile." };
      }
      await fetchProfile();
      setLoading(false);
      return { error: null };
    } catch {
      setLoading(false);
      return { error: "Failed to update profile." };
    }
  };

  // --- Auth State Change effect (sync context with Supabase) ---
  useEffect(() => {
    // Listener: triggers on login/logout/session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({ mobile: session.user.phone || "", role: undefined });
        setTimeout(fetchProfile, 0);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    // Initial load: check if session user/profile exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ mobile: session.user.phone || "", role: undefined });
        fetchProfile();
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

  // --- Send OTP via Edge Function or dummy for testing ---
  const sendOtp = async (mobile: string) => {
    // Dummy test bypass for number 9999999999
    if (mobile === "9999999999") {
      return { error: null };
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${SUPABASE_FUNCTIONS_BASE}/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  // --- Verify OTP and link to Supabase user system or dummy for testing ---
  const verifyOtp = async (mobile: string, otp: string) => {
    // Dummy test bypass for 9999999999 + 1234 or 123456
    if (mobile === "9999999999" && (otp === "1234" || otp === "123456")) {
      setUser({ mobile: "9999999999", role: "admin" });
      setUserProfile({
        full_name: "Test Admin",
        email: "admin@example.com",
        mobile: "9999999999"
      });
      return { error: null };
    }
    setLoading(true);
    try {
      // Step 1: Verify with Twilio via edge function
      const response = await fetch(
        `${SUPABASE_FUNCTIONS_BASE}/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

      // Step 2: Ensure Supabase Auth user exists
      const phone = mobile.startsWith('+') ? mobile : `+91${mobile}`;
      let getUserRes = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: false } });

      if (getUserRes.error && getUserRes.error.message?.toLowerCase().includes('user not found')) {
        const password = randomPassword();
        await supabase.auth.signUp({ phone, password });
        getUserRes = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: false } });
      }

      if (getUserRes.error) {
        setLoading(false);
        return { error: getUserRes.error.message || "Supabase user creation failed." };
      }

      // Confirmed: user exists & authenticated
      setUser({ mobile, role: undefined });
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      console.error("verifyOtp error:", error);
      return { error: "Verification failed. Please check your details and try again." };
    }
  };

  // --- Logout and cleanup ---
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
      fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook: for consumer components ---
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
