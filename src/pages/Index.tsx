
import { useAuth } from "@/hooks/useAuth";
import EmailAuthPage from "@/components/EmailAuthPage";
import ClientDashboard from "@/components/ClientDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import StaffDashboard from "@/components/StaffDashboard";

const Index = () => {
  const { user, userRole, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Pass onAuth callback for reloading user state
    return <EmailAuthPage onAuth={() => window.location.reload()} />;
  }

  const handleLogout = async () => {
    await signOut();
  };

  // Route based on user role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard onLogout={handleLogout} />;
    case 'staff':
      return <StaffDashboard onLogout={handleLogout} />;
    case 'client':
    default:
      return (
        <ClientDashboard 
          userMobile={user.email || user.user_metadata?.email || ''} 
          onLogout={handleLogout} 
        />
      );
  }
};

export default Index;
