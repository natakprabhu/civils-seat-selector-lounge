import { useAuth } from "@/hooks/useAuth";
import EmailAuthPage from "@/components/EmailAuthPage";
import ClientDashboard from "@/components/ClientDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import StaffDashboard from "@/components/StaffDashboard";

const Index = () => {
  const { user, userRole, loading, signOut } = useAuth();

  // Debugging logs
  console.log("Index.tsx render", { user, userRole, loading });

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

  // Render dashboards with dummy data UI only
  switch (userRole) {
    case 'admin':
      return <AdminDashboard onLogout={handleLogout} />;
    case 'staff':
      return <StaffDashboard onLogout={handleLogout} />;
    case 'client':
    default:
      return <ClientDashboard userMobile={"9999999999"} onLogout={handleLogout} />;
  }
};

export default Index;
