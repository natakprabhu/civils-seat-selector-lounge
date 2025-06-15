
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";

// Extended user representation to include Supabase auth, profile, and roles.
interface AuthContextType {
  user: { 
    id: string;
    mobile: string;
    email?: string;
    full_name?: string;
    role?: string;
    loadingProfile?: boolean;
  } | null;
  loading: boolean;
  sendOtp: (mobile: string) => Promise<{ error: any }>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get Edge Function URL
const SUPABASE_FUNCTIONS_BASE = "https://llvujxdmzuyebkzuutqn.functions.supabase.co";

// Helper to fetch extended profile (called after login/OTP!)
async function fetchUserProfileAndRole(userId: string) {
  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email, mobile")
    .eq("id", userId)
    .single();

  // Fetch user role
  const { data: roles, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  // Fallback: role is first available role or blank
  const role = (roles && roles[0] && roles[0].role) || undefined;

  return {
    ...profile,
    role,
    profileError,
    roleError
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [loading, setLoading] = useState(false);

  // Helper: call after authenticated to load extended info
  const loadFullUser = async (supabaseUser: any) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }
    const { id, phone, email } = supabaseUser;
    setUser({
      id,
      mobile: phone || "",
      email: email || "",
      loadingProfile: true
    });
    // Fetch from profiles and user_roles
    const extended = await fetchUserProfileAndRole(id);
    setUser({
      id,
      mobile: phone || "",
      email: (extended?.email ?? email) || "",
      full_name: extended?.full_name || "",
      role: extended?.role || "",
      loadingProfile: false
    });
  };

  // --- OTP FLOW, with bypass for demo/admin
  const sendOtp = async (mobile: string) => {
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
      const res = await response.json();
      setLoading(false);
      if (!response.ok) {
        console.error("OTP send failed:", res.error || "Unknown error");
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
    // ADMIN BYPASS (make role always "admin" for test number)
    if (mobile === "9999999999" && (otp === "1234" || otp === "123456")) {
      setUser({
        id: "demo-admin-id", // Not a real user! For demo UI only
        mobile,
        full_name: "Test Admin",
        email: "admin@example.com",
        role: "admin"
      });
      setLoading(false);
      return { error: null };
    }

    setLoading(true);
    try {
      // Check if user exists by phone number (for compatibility)
      const { data: userData, error: authError } = await supabase.auth.signInWithOtp({
        phone: mobile, 
        options: {
          shouldCreateUser: true
        }
      });
      if (authError) {
        setLoading(false);
        return { error: authError.message || "Failed to sign in with OTP." };
      }
      // Now try to sign in with OTP (simulate for demo)
      const { data: { user: supabaseUser }, error: otpError } = await supabase.auth.getUser();
      if (!supabaseUser || otpError) {
        setLoading(false);
        return { error: otpError?.message || "Failed to get user after OTP." };
      }
      // Load extended info
      await loadFullUser(supabaseUser);
      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      console.error("OTP verification error:", error);
      return { error: "Verification failed. Please check your details and try again." };
    }
  };

  const signOut = async () => {
    setUser(null);
    await supabase.auth.signOut();
  };

  // Force (re)load the profile & roles after login
  const refetchProfile = async () => {
    setLoading(true);
    const { data: { user: supUser } } = await supabase.auth.getUser();
    if (supUser) {
      await loadFullUser(supUser);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  // On mount: pull any session from Supabase and fetch profile/role
  useEffect(() => {
    setLoading(true);
    // Listen to auth changes (session persistence)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadFullUser(session.user);
      } else {
        setUser(null);
      }
    });
    // Initial load (in case user already logged in)
    supabase.auth.getUser().then(({ data: { user: supUser } }) => {
      if (supUser) {
        loadFullUser(supUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      sendOtp,
      verifyOtp,
      signOut,
      refetchProfile
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
