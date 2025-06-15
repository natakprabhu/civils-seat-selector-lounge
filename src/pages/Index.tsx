
import { useAuth } from "@/hooks/useAuth";
import AuthPage from "@/components/AuthPage";
import ClientDashboard from "@/components/ClientDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import StaffDashboard from "@/components/StaffDashboard";

const Index = () => {
  const { user, userRole, loading, signOut } = useAuth();

  // Debug logs for state
  console.log("INDEX_PAGE_STATE:", { user, userRole, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
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
          userMobile={user.phone || user.user_metadata?.mobile || ''} 
          onLogout={handleLogout} 
        />
      );
  }
};

export default Index;
