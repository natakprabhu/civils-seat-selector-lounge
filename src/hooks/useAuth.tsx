
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

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
    // Check for existing session in localStorage
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
          const parsedSession = JSON.parse(sessionData);
          const mockUser = {
            phone: parsedSession.mobile,
            user_metadata: { mobile: parsedSession.mobile }
          };
          setUser(mockUser);
          setSession(parsedSession);
          setUserRole(parsedSession.role);
        }
      } catch (error) {
        console.error('Error parsing session:', error);
        localStorage.removeItem('userSession');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (mobile: string, userType: 'client' | 'admin' | 'staff') => {
    try {
      const sessionData = {
        mobile,
        role: userType,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('userSession', JSON.stringify(sessionData));
      
      const mockUser = {
        phone: mobile,
        user_metadata: { mobile }
      };
      
      setUser(mockUser);
      setSession(sessionData);
      setUserRole(userType);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
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
