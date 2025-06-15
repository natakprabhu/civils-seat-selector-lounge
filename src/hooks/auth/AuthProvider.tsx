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

  // Send OTP: always use signInWithOtp, try login flow first
  const sendOtp = async (mobile: string) => {
    setLoading(true);
    try {
      const phone = mobile.startsWith('+') ? mobile : `+91${mobile}`;
      let result = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: false } });

      // If user doesn't exist, try registration mode
      if (
        result.error && 
        result.error.message && 
        result.error.message.toLowerCase().includes("signups not allowed for otp") // message from supabase
      ) {
        // This means user does not exist; try to create
        result = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
        if (result.error) {
          setLoading(false);
          return { error: result.error.message || "Unable to send OTP. Please try again." };
        }
      }
      // If error but not "signups not allowed", report it
      if (result.error) {
        setLoading(false);
        return { error: result.error.message || "Unable to send OTP. Please try again." };
      }
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      return { error: "Failed to send OTP. Please try again." };
    }
  };

  // Verify OTP: always use supabase.auth.verifyOtp
  const verifyOtp = async (mobile: string, otp: string) => {
    setLoading(true);
    try {
      const phone = mobile.startsWith('+') ? mobile : `+91${mobile}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        setLoading(false);
        let errMsg = "Verification failed. Please check your details and try again.";
        if (error.message && error.message.toLowerCase().includes("invalid or expired otp")) {
          errMsg = "Invalid or expired OTP. Please resend and try again.";
        }
        return { error: errMsg };
      }

      // Handle session
      if (data?.session && data.session.user) {
        setUser({ mobile: data.session.user.phone || "", role: undefined });
        setTimeout(fetchProfile, 0); // fetch profile after login
      } else {
        setUser(null);
        setUserProfile(null);
      }

      setLoading(false);
      return { error: null };
    } catch (error: any) {
      setLoading(false);
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

/*
 * To store custom session info or extend phone info separately from Supabase Auth,
 * add this table via SQL (sessions are automatically handled by Supabase Auth):
 *
 * CREATE TABLE public.phone_sessions (
 *   id uuid primary key default gen_random_uuid(),
 *   user_id uuid references auth.users not null,
 *   phone text not null,
 *   created_at timestamptz default now()
 * );
 *
 * But for most use-cases, the built-in Supabase Auth stores secure session tokens and phone mapping.
 */
