
import { useAuth } from "@/hooks/useAuth";
import AuthPage from "@/components/AuthPage";
import ClientDashboard from "@/components/ClientDashboard";

// Removed AdminDashboard and StaffDashboard for now, as roles aren't provided
// import AdminDashboard from "@/components/AdminDashboard";
// import StaffDashboard from "@/components/StaffDashboard";

const Index = () => {
  const { user, loading, signOut } = useAuth();

  console.log("INDEX_PAGE_STATE:", { user, loading });

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

  // Since role info is not set in AuthContext, always render ClientDashboard
  return (
    <ClientDashboard 
      userMobile={user.mobile || ''} 
      onLogout={handleLogout} 
    />
  );
};

export default Index;
