
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (mobile: string, userType: 'client' | 'admin' | 'staff') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Helper to actually fetch the true user role from Supabase
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

  useEffect(() => {
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch actual user role from DB
        fetchUserRoleFromDb(session.user.id).then((role) => {
          setUserRole(role || null);
          // Save to localStorage for convenience, but main source of truth is DB
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoleFromDb(session.user.id).then((role) => {
          setUserRole(role || null);
          // Save to localStorage for convenience, but main source of truth is DB
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

  const signIn = async (mobile: string, userType: 'client' | 'admin' | 'staff') => {
    try {
      const email = `${mobile}@example.com`;
      const password = 'password123';

      let authResponse = await supabase.auth.signInWithPassword({ email, password });

      // Handle sign up if user doesn't exist
      if (authResponse.error && authResponse.error.message === 'Invalid login credentials') {
        authResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: `User ${mobile}`,
              mobile: mobile,
            },
            emailRedirectTo: `${window.location.origin}/`,
          }
        });
        if (authResponse.error) throw authResponse.error;
      }

      if (authResponse.error) throw authResponse.error;

      let newSession = authResponse.data.session;
      if (!newSession) {
        throw new Error("Authentication with Supabase failed. Email confirmation may be required.");
      }
      setSession(newSession);
      setUser(newSession.user);

      // Get the actual user role from DB (so manual promotion works)
      const dbRole = await fetchUserRoleFromDb(newSession.user.id);

      const sessionData = {
        mobile,
        role: dbRole || userType,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('userSession', JSON.stringify(sessionData));
      setUserRole(dbRole || userType);
      setLoading(false);

      return { error: null };
    } catch (error) {
      console.error('Auth error:', error);
      setLoading(false);
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
      signIn,
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

