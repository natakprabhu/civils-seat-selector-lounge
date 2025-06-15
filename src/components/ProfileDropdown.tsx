import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
// ... keep existing imports and dropdown structure ...

const ProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ full_name?: string; email?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle();
        setProfile(data || null);
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="px-4 py-3">
      <div className="font-bold">{profile?.full_name || "Loading..."}</div>
      <div className="text-sm text-slate-500">{profile?.email || user.email || ""}</div>
      <button onClick={signOut} className="text-left mt-2 text-blue-600">Logout</button>
    </div>
  );
};

export default ProfileDropdown;
