
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

  useEffect(() => {
    // Set up Supabase auth state listeners and populate state
    setLoading(true);

    // 1. Listen for auth changes and set session/user accordingly
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Try to get userRole from localStorage if present
        const saved = localStorage.getItem('userSession');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUserRole(parsed.role || null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    // 2. On mount, check for session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const saved = localStorage.getItem('userSession');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUserRole(parsed.role || null);
        }
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
        // Ask user to check email if necessary
        if (authResponse.error) throw authResponse.error;
      }

      if (authResponse.error) throw authResponse.error;

      // Successful login, update state
      // { user, session } returned, or may need to fetch with getSession
      let newSession = authResponse.data.session;
      if (!newSession) {
        // Email confirm required, most likely; show error
        throw new Error("Authentication with Supabase failed. Email confirmation may be required.");
      }
      setSession(newSession);
      setUser(newSession.user);

      // Save mobile/role to localStorage for display/role-picking
      const sessionData = {
        mobile,
        role: userType,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('userSession', JSON.stringify(sessionData));
      setUserRole(userType);
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

