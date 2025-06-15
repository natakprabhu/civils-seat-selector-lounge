
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { randomPassword, SUPABASE_FUNCTIONS_BASE } from "./helpers";

// Types
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

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State
  const [user, setUser] = useState<{ mobile: string; role?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; email?: string; mobile?: string } | null>({
    full_name: "",
    email: "",
    mobile: ""
  });
  const [loading, setLoading] = useState(false);

  // Fetch profile info
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

  // Complete profile
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

  // Auth State Change (login/logout/session)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({ mobile: session.user.phone || "", role: undefined });
        setTimeout(fetchProfile, 0);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ mobile: session.user.phone || "", role: undefined });
        fetchProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Send OTP
  const sendOtp = async (mobile: string) => {
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

  // Verify OTP
  const verifyOtp = async (mobile: string, otp: string) => {
    setLoading(true);
    try {
      // Step 1: Verify with Twilio
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

      setUser({ mobile, role: undefined });
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      console.error("verifyOtp error:", error);
      return { error: "Verification failed. Please check your details and try again." };
    }
  };

  // Sign Out
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
