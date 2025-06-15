import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: { mobile: string; role?: string } | null;
  loading: boolean;
  sendOtp: (mobile: string) => Promise<{ error: any }>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get Edge Function URL
const SUPABASE_FUNCTIONS_BASE = "https://llvujxdmzuyebkzuutqn.functions.supabase.co";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ mobile: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // No user session persistence for demo; you could use localStorage if desired

  const sendOtp = async (mobile: string) => {
    // Bypass for admin - don't actually send OTP
    if (mobile === "9999999999") {
      setLoading(false);
      return { error: null };
    }

    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      // The edge functions always return JSON
      const res = await response.json();
      setLoading(false);

      if (!response.ok) {
        console.error(res.error || "Failed to send OTP");
        return { error: res.error || "Failed to send OTP" };
      }
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error: error?.toString() || "Unknown error" };
    }
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    // ADMIN BYPASS: allow logging in as admin with code 0000
    if (mobile === "9999999999" && otp === "0000") {
      setUser({ mobile, role: "admin" });
      setLoading(false);
      return { error: null };
    }
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const res = await response.json();
      setLoading(false);

      if (res.success) {
        setUser({ mobile });
        return { error: null };
      } else {
        return { error: res.error || "Invalid OTP" };
      }
    } catch (error) {
      setLoading(false);
      return { error: error?.toString() || "Unknown error" };
    }
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      sendOtp,
      verifyOtp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
