
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        setFullName(data?.full_name || "");
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
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Not logged in</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <h1 className="text-3xl md:text-5xl font-extrabold text-white">
        {fullName ? `WELCOME ${fullName.toUpperCase()}` : "WELCOME"}
      </h1>
    </div>
  );
};

export default Index;

