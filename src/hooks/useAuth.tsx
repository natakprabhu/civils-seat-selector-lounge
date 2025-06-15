
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signInWithPhone: (mobile: string) => Promise<{ error: any }>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Helper to fetch user role from Supabase user_roles table
  const fetchUserRoleFromDb = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('assigned_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0].role;
    } else {
      return null;
    }
  };

  // Auth state initialization
  useEffect(() => {
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchUserRoleFromDb(session.user.id).then((role) => {
            setUserRole(role || null);
            // Store extra in localStorage if needed
            const old = localStorage.getItem('userSession');
            let obj = { mobile: session.user.phone || '', role, loginTime: new Date().toISOString() };
            if (old) {
              try {
                obj = { ...JSON.parse(old), role };
              } catch { }
            }
            localStorage.setItem('userSession', JSON.stringify(obj));
          });
        }, 0);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoleFromDb(session.user.id).then((role) => {
          setUserRole(role || null);
          const old = localStorage.getItem('userSession');
          let obj = { mobile: session.user.phone || '', role, loginTime: new Date().toISOString() };
          if (old) {
            try {
              obj = { ...JSON.parse(old), role };
            } catch {}
          }
          localStorage.setItem('userSession', JSON.stringify(obj));
        });
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Send OTP to phone (sign in/up with phone)
  const signInWithPhone = async (mobile: string) => {
    setLoading(true);
    try {
      // Must be in E.164 format. We'll assume Indian numbers for demo. Adjust country code as needed.
      const phone = mobile.startsWith('+') ? mobile : '+91' + mobile;

      // Always try signInWithOtp to trigger OTP send
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true, // will create user if doesn't exist
        }
      });

      setLoading(false);

      if (error) {
        console.error('Send OTP error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      setLoading(false);
      console.error('signInWithPhone error:', error);
      return { error };
    }
  };

  // Verify OTP for login/signup
  const verifyOtp = async (mobile: string, otp: string) => {
    setLoading(true);
    try {
      const phone = mobile.startsWith('+') ? mobile : '+91' + mobile;
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });

      setLoading(false);

      if (error) {
        console.error('OTP verification error:', error);
        return { error };
      }

      // Update session and user
      setUser(data?.user ?? null);
      setSession(data?.session ?? null);

      // Fetch latest userRole after success
      if (data?.user) {
        const role = await fetchUserRoleFromDb(data.user.id);
        setUserRole(role || null);
        const old = localStorage.getItem('userSession');
        let obj = { mobile: data.user.phone || '', role, loginTime: new Date().toISOString() };
        if (old) {
          try {
            obj = { ...JSON.parse(old), role };
          } catch {}
        }
        localStorage.setItem('userSession', JSON.stringify(obj));
      } else {
        setUserRole(null);
      }

      return { error: null };
    } catch (error) {
      setLoading(false);
      console.error('verifyOtp error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userSession');
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithPhone,
      verifyOtp,
      signOut,
      userRole
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
