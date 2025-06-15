import { useAuth } from "@/hooks/useAuth";
import AuthPage from "@/components/AuthPage";
import ClientDashboard from "@/components/ClientDashboard";
import AdminDashboard from "@/components/AdminDashboard";

const Index = () => {
  const { user, signOut } = useAuth();

  console.log("INDEX_PAGE_STATE:", { user });

  if (!user) {
    return <AuthPage />;
  }

  const handleLogout = async () => {
    await signOut();
  };

  // Render admin dashboard if user.role === 'admin'
  if (user.role === "admin") {
    return (
      <AdminDashboard onLogout={handleLogout} />
    );
  }

  // Default: client dashboard
  return (
    <ClientDashboard
      userMobile={user.mobile || ''}
      onLogout={handleLogout}
    />
  );
};

export default Index;
