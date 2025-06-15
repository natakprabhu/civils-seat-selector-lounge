import { useAuth } from "@/hooks/useAuth";
import EmailAuthPage from "@/components/EmailAuthPage";
import ClientDashboard from "@/components/ClientDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import StaffDashboard from "@/components/StaffDashboard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        if (data?.full_name) {
          setFullName(data.full_name);
        }
      }
    };
    fetchProfile();
  }, [user]);

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

  // Render homepage with welcome message and user's full name in caps
  // Show dashboard based on role, but at top show the welcome message
  const capitalizedName = fullName ? fullName.toUpperCase() : "";

  let dashboardComponent = null;
  switch (userRole) {
    case 'admin':
      dashboardComponent = <AdminDashboard onLogout={handleLogout} />;
      break;
    case 'staff':
      dashboardComponent = <StaffDashboard onLogout={handleLogout} />;
      break;
    case 'client':
    default:
      dashboardComponent = (
        <ClientDashboard 
          userMobile={user.email || user.user_metadata?.email || ''} 
          onLogout={handleLogout} 
        />
      );
      break;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="w-full text-center py-8 text-2xl font-bold tracking-widest">
        {capitalizedName
          ? `WELCOME ${capitalizedName}`
          : "WELCOME"}
      </div>
      <div className="flex-1">
        {dashboardComponent}
      </div>
    </div>
  );
};

export default Index;
