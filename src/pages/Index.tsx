
import { useAuth } from "@/hooks/useAuth";
import PreLoginPage from "@/components/PreLoginPage";
import ClientDashboard from "@/components/ClientDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import StaffDashboard from "@/components/StaffDashboard";

const Index = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <PreLoginPage onLogin={() => {}} />;
  }

  // Handle demo login from PreLoginPage (backwards compatibility)
  const handleDemoLogin = (mobile: string, userType: 'client' | 'admin' | 'staff') => {
    // This is handled by the auth system now
    console.log('Demo login attempted:', mobile, userType);
  };

  // Route based on user role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'client':
    default:
      return <ClientDashboard />;
  }
};

export default Index;
