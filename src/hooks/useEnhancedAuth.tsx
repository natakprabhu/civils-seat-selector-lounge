
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced auth hook: ensures
 * - session/user states are always current
 * - exposes phone-verified state
 */
export function useEnhancedAuth() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
  }, []);

  // Set up onAuthStateChange to stay up-to-date
  useEffect(() => {
    setLoading(true);
    refreshUser();

    const { data: subscription } = supabase.auth.onAuthStateChange((_evt, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription?.unsubscribe();
  }, [refreshUser]);

  // Checks if user's email is confirmed and phone is present/confirmed
  const isEmailConfirmed = !!user?.email_confirmed_at || false;
  const phone = user?.phone ?? null; // Supabase sets this once user verifies it
  const isPhoneVerified = !!phone && phone.length > 0;

  return { user, session, loading, isEmailConfirmed, isPhoneVerified, refreshUser };
}
